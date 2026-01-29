import { BlockPosition } from '../interfaces';
import { ValidationResult } from '../types';
import { CropConfig } from '../config';
import { IConditionValidator, IWorld, Block } from './IConditionValidator';

/**
 * Abstract base class for condition validators.
 * Provides common validation logic that can be reused across all crop types.
 * Specific crop validators should extend this class and customize as needed.
 * 
 * @template T The crop type this validator is for
 */
export abstract class BaseConditionValidator<T> implements IConditionValidator<T> {
  protected config: CropConfig;
  protected world: IWorld;
  
  /**
   * Create a new condition validator.
   * @param config Configuration for the crop type
   * @param world World interface for accessing blocks
   */
  constructor(config: CropConfig, world: IWorld) {
    this.config = config;
    this.world = world;
  }
  
  /**
   * Check if a crop can be planted at the given position.
   * This checks soil validity only.
   * Space checking is done separately by the crop system to provide specific error messages.
   * 
   * @param position Position where planting is attempted
   * @returns Validation result with reason if invalid
   */
  canPlant(position: BlockPosition): ValidationResult {
    // Check soil validity
    if (!this.isValidSoil(position)) {
      return {
        valid: false,
        reason: 'Invalid soil type. This crop requires specific soil conditions.'
      };
    }
    
    // Soil check passed
    return { valid: true };
  }
  
  /**
   * Check if the soil at the given position is valid for this crop.
   * This implementation checks against the validSoilTypes in the config.
   * 
   * @param position Position to check (the block below will be checked)
   * @returns True if soil is valid
   */
  isValidSoil(position: BlockPosition): boolean {
    // Get the block below the planting position
    const soilPosition: BlockPosition = {
      ...position,
      y: position.y - 1
    };
    
    const soilBlock = this.world.getBlock(soilPosition);
    
    // Check if the soil type is in the valid list
    return this.config.validSoilTypes.includes(soilBlock.type);
  }
  
  /**
   * Check if there is free space above the position for the crop to grow.
   * For planting: checks if the crop position itself is free
   * For growth: checks if the space above the crop is free
   * 
   * @param position Position to check
   * @param checkAbove If true, checks y+1; if false, checks the position itself
   * @returns True if space is available
   */
  hasSpaceAbove(position: BlockPosition, checkAbove: boolean = false): boolean {
    // Determine which position to check
    const checkPosition = checkAbove 
      ? { ...position, y: position.y + 1 }
      : position;
    
    const block = this.world.getBlock(checkPosition);
    
    // The space is available if it's air or another non-solid block
    return block.type === 'air' || block.type === 'water' || block.type === 'grass';
  }
  
  /**
   * Check if a crop can continue growing at the given position.
   * This checks light level and space requirements.
   * 
   * @param position Position of the crop
   * @returns Validation result with reason if growth is blocked
   */
  canGrow(position: BlockPosition): ValidationResult {
    // Check light level
    const lightLevel = this.getLightLevel(position);
    if (lightLevel < this.config.minLightLevel) {
      return {
        valid: false,
        reason: `Insufficient light. Requires at least ${this.config.minLightLevel}, current: ${lightLevel}`
      };
    }
    
    // Check space above (in case something was placed on top)
    if (!this.hasSpaceAbove(position, true)) {
      return {
        valid: false,
        reason: 'Space above is obstructed. Remove the obstruction for growth to continue.'
      };
    }
    
    // All checks passed
    return { valid: true };
  }
  
  /**
   * Get the light level at the given position.
   * 
   * @param position Position to check
   * @returns Light level (0-15)
   */
  getLightLevel(position: BlockPosition): number {
    return this.world.getLightLevel(position);
  }
  
  /**
   * Check if the position is exposed to the sky.
   * This is used for rain bonus calculations.
   * 
   * @param position Position to check
   * @returns True if exposed to sky
   */
  isExposedToSky(position: BlockPosition): boolean {
    return this.world.isExposedToSky(position);
  }
}
