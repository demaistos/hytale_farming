import { BaseGrowthEngine } from './BaseGrowthEngine';
import { OatCrop } from '../models/OatCrop';
import { CropConfig } from '../config';
import { IConditionValidator } from '../validation/IConditionValidator';

/**
 * Growth engine specifically for Oat crops.
 * Uses the base implementation with oat-specific configuration.
 * 
 * Oat growth characteristics:
 * - Total growth time: 4 in-game days (345,600 seconds)
 * - Stage distribution: 25% per stage (86,400 seconds each)
 * - Water bonus: +15% (multiplier 1.15)
 * - Rain bonus: +10% (multiplier 1.10)
 * - Bonuses are additive: both active = +25% (multiplier 1.25)
 * 
 * Growth stages:
 * 1. Germination (0-86,400 seconds)
 * 2. Young Sprout (86,400-172,800 seconds)
 * 3. Growth (172,800-259,200 seconds)
 * 4. Maturity (259,200-345,600 seconds)
 * 
 * Validates: Requirements 1.3, 2.1, 2.2, 2.3, 2.4, 2.5
 */
export class OatGrowthEngine extends BaseGrowthEngine<OatCrop> {
  /**
   * Create a new oat growth engine.
   * 
   * @param config Oat system configuration
   * @param validator Validator for checking oat growth conditions
   */
  constructor(config: CropConfig, validator: IConditionValidator<OatCrop>) {
    super(config, validator);
  }
  
  /**
   * Oats use the standard growth logic from the base class.
   * 
   * If oats needed special growth behavior (e.g., faster growth in specific biomes,
   * or special stage transitions), we could override methods here.
   * 
   * Example of potential customization:
   * 
   * calculateStageProgress(crop: OatCrop, deltaTime: number, bonuses: GrowthBonuses): number {
   *   // Call base implementation
   *   let progress = super.calculateStageProgress(crop, deltaTime, bonuses);
   *   
   *   // Add oat-specific bonus (e.g., 10% faster in Plains biome)
   *   if (this.isInPlainsBiome(crop.position)) {
   *     progress *= 1.10;
   *   }
   *   
   *   return progress;
   * }
   */
}

/**
 * Example of how a different crop might customize growth:
 * 
 * export class WheatGrowthEngine extends BaseGrowthEngine<WheatCrop> {
 *   // Wheat grows slower (5 days instead of 4)
 *   // This would be configured in WheatSystemConfig.baseGrowthTime
 *   
 *   // Wheat might have different bonus application
 *   calculateStageProgress(crop: WheatCrop, deltaTime: number, bonuses: GrowthBonuses): number {
 *     // Wheat gets a bigger water bonus but smaller rain bonus
 *     const adjustedBonuses = {
 *       waterBonus: bonuses.waterBonus * 1.2,  // 20% more effective
 *       rainBonus: bonuses.rainBonus * 0.8     // 20% less effective
 *     };
 *     return super.calculateStageProgress(crop, deltaTime, adjustedBonuses);
 *   }
 * }
 * 
 * export class TomatoGrowthEngine extends BaseGrowthEngine<TomatoCrop> {
 *   // Tomatoes might need special handling for the flowering stage
 *   advanceStage(crop: TomatoCrop): void {
 *     super.advanceStage(crop);
 *     
 *     // If entering flowering stage (stage 3), check for pollinators
 *     if (crop.stage === 3) {
 *       this.checkForPollinators(crop);
 *     }
 *   }
 *   
 *   private checkForPollinators(crop: TomatoCrop): void {
 *     // Custom logic for tomato pollination
 *   }
 * }
 */
