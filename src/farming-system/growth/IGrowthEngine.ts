import { GrowthBonuses } from '../interfaces/ICropGrowth';

/**
 * Generic interface for crop growth engines.
 * Manages the progression of crops through their growth stages.
 * 
 * @template T The specific crop type
 */
export interface IGrowthEngine<T> {
  /**
   * Update the growth of a crop based on elapsed time and environmental bonuses.
   * This is the main entry point for growth updates, typically called on each game tick.
   * 
   * @param crop The crop to update
   * @param deltaTime Time elapsed since last update (in seconds)
   * @param bonuses Environmental growth bonuses (water, rain)
   */
  updateGrowth(crop: T, deltaTime: number, bonuses: GrowthBonuses): void;
  
  /**
   * Check if a crop can currently grow based on environmental conditions.
   * This checks light level, space above, and other growth requirements.
   * 
   * @param crop The crop to check
   * @returns True if the crop can grow, false otherwise
   */
  canGrow(crop: T): boolean;
  
  /**
   * Calculate the progress for the current stage based on time and bonuses.
   * Applies the formula: progress = deltaTime * (waterBonus + rainBonus - 1.0)
   * 
   * Note: Bonuses are additive. For example:
   * - No bonuses: waterBonus=1.0, rainBonus=1.0 → multiplier = 1.0
   * - Water only: waterBonus=1.15, rainBonus=1.0 → multiplier = 1.15
   * - Rain only: waterBonus=1.0, rainBonus=1.10 → multiplier = 1.10
   * - Both: waterBonus=1.15, rainBonus=1.10 → multiplier = 1.25
   * 
   * @param crop The crop to calculate progress for
   * @param deltaTime Time elapsed (in seconds)
   * @param bonuses Environmental growth bonuses
   * @returns The progress amount to add to the current stage (in seconds)
   */
  calculateStageProgress(crop: T, deltaTime: number, bonuses: GrowthBonuses): number;
  
  /**
   * Check if the crop should advance to the next stage.
   * Compares the current stage progress against the required time for the stage.
   * 
   * @param crop The crop to check
   * @returns True if the crop should advance, false otherwise
   */
  shouldAdvanceStage(crop: T): boolean;
  
  /**
   * Advance the crop to the next growth stage.
   * Increments the stage number and resets the stage progress.
   * Does not advance beyond the maximum stage (maturity).
   * 
   * @param crop The crop to advance
   */
  advanceStage(crop: T): void;
}
