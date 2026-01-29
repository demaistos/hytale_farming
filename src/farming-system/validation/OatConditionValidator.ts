import { BlockPosition } from '../interfaces';
import { ValidationResult } from '../types';
import { CropConfig } from '../config';
import { BaseConditionValidator } from './BaseConditionValidator';
import { IWorld } from './IConditionValidator';
import { OatCrop } from '../models/OatCrop';

/**
 * Condition validator specialized for oat crops.
 * Oats require tilled soil and have specific light requirements.
 * 
 * This class can be extended in the future if oats need special validation logic
 * beyond what the base validator provides.
 */
export class OatConditionValidator extends BaseConditionValidator<OatCrop> {
  /**
   * Create a new oat condition validator.
   * @param config Configuration for oat crops
   * @param world World interface for accessing blocks
   */
  constructor(config: CropConfig, world: IWorld) {
    super(config, world);
  }
  
  /**
   * Oats use the standard soil validation from the base class.
   * The valid soil types are configured in OatSystemConfig (tilled_soil).
   * 
   * If oats needed special soil validation (e.g., checking moisture level),
   * we could override this method here.
   */
  
  /**
   * Oats use the standard space validation from the base class.
   * All crops need vertical space to grow.
   */
  
  /**
   * Oats use the standard growth validation from the base class.
   * This checks light level (>= 9) and space above.
   * 
   * If oats needed special growth conditions (e.g., temperature checks),
   * we could override canGrow() here.
   */
}

/**
 * Example of how a different crop might customize validation:
 * 
 * export class RiceConditionValidator extends BaseConditionValidator<RiceCrop> {
 *   // Rice requires water adjacent to the soil
 *   isValidSoil(position: BlockPosition): boolean {
 *     // First check if it's tilled soil
 *     if (!super.isValidSoil(position)) {
 *       return false;
 *     }
 *     
 *     // Then check for adjacent water
 *     return this.hasWaterAdjacent(position);
 *   }
 *   
 *   private hasWaterAdjacent(position: BlockPosition): boolean {
 *     // Check 4 horizontal directions for water
 *     // ... implementation ...
 *   }
 * }
 */
