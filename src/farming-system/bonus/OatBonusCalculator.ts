import { BaseBonusCalculator } from './BaseBonusCalculator';
import { OatCrop } from '../models/OatCrop';
import { IWorld } from '../validation/IConditionValidator';
import { CropConfig } from '../config/CropConfig';

/**
 * Bonus calculator specifically for Oat crops.
 * Uses the base implementation with oat-specific configuration.
 * 
 * Bonuses:
 * - Water bonus: +15% (multiplier 1.15) when water is within 4 blocks (Manhattan distance)
 * - Rain bonus: +10% (multiplier 1.10) when raining and crop is exposed to sky
 * 
 * Validates: Requirements 2.2, 2.3, 11.1, 11.2, 11.4, 12.1, 12.3
 */
export class OatBonusCalculator extends BaseBonusCalculator<OatCrop> {
  /**
   * Create a new oat bonus calculator.
   * 
   * @param world World interface for accessing blocks
   * @param config Oat system configuration
   */
  constructor(world: IWorld, config: CropConfig) {
    super(world, config);
  }
}
