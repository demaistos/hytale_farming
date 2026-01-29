import { IGrowthEngine } from './IGrowthEngine';
import { GrowthBonuses } from '../interfaces/ICropGrowth';
import { ICrop } from '../interfaces';
import { CropConfig } from '../config';
import { IConditionValidator } from '../validation/IConditionValidator';

/**
 * Base implementation of the growth engine with common logic.
 * Provides generic growth progression that can be used by any crop type.
 * 
 * This class handles:
 * - Stage progression based on time and bonuses
 * - Validation of growth conditions
 * - Calculation of stage progress with bonus application
 * - Stage advancement with proper bounds checking
 * 
 * @template T The specific crop type (must implement ICrop)
 */
export abstract class BaseGrowthEngine<T extends ICrop> implements IGrowthEngine<T> {
  /**
   * Configuration for the crop type.
   */
  protected config: CropConfig;
  
  /**
   * Validator for checking growth conditions.
   */
  protected validator: IConditionValidator<T>;
  
  /**
   * Create a new base growth engine.
   * 
   * @param config Configuration for the crop type
   * @param validator Validator for checking growth conditions
   */
  constructor(config: CropConfig, validator: IConditionValidator<T>) {
    this.config = config;
    this.validator = validator;
  }
  
  /**
   * Update the growth of a crop based on elapsed time and environmental bonuses.
   * 
   * Algorithm:
   * 1. Check if the crop can grow (light, space, etc.)
   * 2. If not, return without progression
   * 3. Calculate stage progress with bonuses applied
   * 4. Add progress to the crop's stage progress
   * 5. Check if the crop should advance to the next stage
   * 6. If yes, advance the stage and reset progress
   * 7. Update total age
   * 
   * Validates: Requirements 1.3, 2.1, 2.2, 2.3, 2.4, 2.5
   * 
   * @param crop The crop to update
   * @param deltaTime Time elapsed since last update (in seconds)
   * @param bonuses Environmental growth bonuses
   */
  updateGrowth(crop: T, deltaTime: number, bonuses: GrowthBonuses): void {
    // Check if the crop can grow (light, space, etc.)
    if (!this.canGrow(crop)) {
      // Growth is suspended - don't progress
      return;
    }
    
    // Check if already at maximum maturity
    if (crop.stage >= this.config.stageCount) {
      // Already mature - no further progression
      return;
    }
    
    // Calculate progress with bonuses applied
    const progress = this.calculateStageProgress(crop, deltaTime, bonuses);
    
    // Add progress to current stage
    crop.stageProgress += progress;
    crop.totalAge += progress;
    
    // Check if we should advance to the next stage
    while (this.shouldAdvanceStage(crop)) {
      this.advanceStage(crop);
      
      // Stop if we've reached maturity
      if (crop.stage >= this.config.stageCount) {
        break;
      }
    }
    
    // Update last update time
    crop.lastUpdateTime = Date.now();
  }
  
  /**
   * Check if a crop can currently grow based on environmental conditions.
   * Uses the condition validator to check light level and space above.
   * 
   * Validates: Requirements 6.3, 6.4, 6.5, 6.6
   * 
   * @param crop The crop to check
   * @returns True if the crop can grow, false otherwise
   */
  canGrow(crop: T): boolean {
    const result = this.validator.canGrow(crop.position);
    return result.valid;
  }
  
  /**
   * Calculate the progress for the current stage based on time and bonuses.
   * 
   * Formula: progress = deltaTime * (waterBonus + rainBonus - 1.0)
   * 
   * This formula ensures bonuses are additive:
   * - No bonuses: 1.0 + 1.0 - 1.0 = 1.0 (normal speed)
   * - Water only: 1.15 + 1.0 - 1.0 = 1.15 (+15%)
   * - Rain only: 1.0 + 1.10 - 1.0 = 1.10 (+10%)
   * - Both: 1.15 + 1.10 - 1.0 = 1.25 (+25%)
   * 
   * Validates: Requirements 2.2, 2.3, 2.4
   * 
   * @param crop The crop to calculate progress for
   * @param deltaTime Time elapsed (in seconds)
   * @param bonuses Environmental growth bonuses
   * @returns The progress amount to add to the current stage (in seconds)
   */
  calculateStageProgress(crop: T, deltaTime: number, bonuses: GrowthBonuses): number {
    // Apply bonuses additively
    const multiplier = bonuses.waterBonus + bonuses.rainBonus - 1.0;
    return deltaTime * multiplier;
  }
  
  /**
   * Check if the crop should advance to the next stage.
   * Compares the current stage progress against the required time for the stage.
   * 
   * Validates: Requirements 1.3
   * 
   * @param crop The crop to check
   * @returns True if the crop should advance, false otherwise
   */
  shouldAdvanceStage(crop: T): boolean {
    // Don't advance if already at maximum stage
    if (crop.stage >= this.config.stageCount) {
      return false;
    }
    
    // Get the time required for the current stage
    const stageTime = this.getStageTime(crop.stage);
    
    // Check if we've accumulated enough progress
    return crop.stageProgress >= stageTime;
  }
  
  /**
   * Advance the crop to the next growth stage.
   * Increments the stage number and resets the stage progress.
   * Carries over any excess progress to the next stage.
   * 
   * Validates: Requirements 1.3, 1.4
   * 
   * @param crop The crop to advance
   */
  advanceStage(crop: T): void {
    // Don't advance beyond maximum stage
    if (crop.stage >= this.config.stageCount) {
      // Cap progress at stage time to prevent overflow
      const stageTime = this.getStageTime(crop.stage);
      crop.stageProgress = Math.min(crop.stageProgress, stageTime);
      return;
    }
    
    // Get the time required for the current stage
    const stageTime = this.getStageTime(crop.stage);
    
    // Calculate excess progress to carry over
    const excessProgress = crop.stageProgress - stageTime;
    
    // Advance to next stage
    crop.stage += 1;
    
    // Reset progress with excess carried over
    crop.stageProgress = Math.max(0, excessProgress);
    
    // Update visual height for the new stage
    this.updateVisualHeight(crop);
  }
  
  /**
   * Get the time required for a specific stage.
   * 
   * @param stage The stage number (1-based)
   * @returns Time in seconds
   */
  protected getStageTime(stage: number): number {
    const stageIndex = stage - 1; // Convert to 0-based index
    if (stageIndex < 0 || stageIndex >= this.config.stageDistribution.length) {
      return 0;
    }
    return this.config.baseGrowthTime * this.config.stageDistribution[stageIndex];
  }
  
  /**
   * Update the visual height of the crop based on its current stage.
   * 
   * @param crop The crop to update
   */
  protected updateVisualHeight(crop: T): void {
    const visual = this.config.stageVisuals.find(v => v.stage === crop.stage);
    if (visual) {
      crop.visualHeight = visual.height;
      
      // Apply random variation if specified
      if (visual.heightVariation) {
        crop.visualHeight += Math.random() * visual.heightVariation;
      }
    }
  }
}
