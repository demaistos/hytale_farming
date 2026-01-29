import { BlockPosition } from '../interfaces';
import { IBonusCalculator, GrowthBonuses } from './IBonusCalculator';
import { IWorld } from '../validation/IConditionValidator';
import { CropConfig } from '../config/CropConfig';

/**
 * Base implementation of bonus calculator with common logic.
 * Specific crop types can extend this to customize bonus calculations.
 * 
 * @template T The crop type this calculator is for
 */
export abstract class BaseBonusCalculator<T> implements IBonusCalculator<T> {
  protected world: IWorld;
  protected config: CropConfig;
  protected isRainingFlag: boolean;
  
  /**
   * Create a new bonus calculator.
   * 
   * @param world World interface for accessing blocks
   * @param config Crop configuration with bonus multipliers
   */
  constructor(world: IWorld, config: CropConfig) {
    this.world = world;
    this.config = config;
    this.isRainingFlag = false;
  }
  
  /**
   * Set the current rain state.
   * In a real implementation, this would be called by the weather system.
   * 
   * @param raining True if it is currently raining
   */
  setRaining(raining: boolean): void {
    this.isRainingFlag = raining;
  }
  
  /**
   * Check if there is water nearby the given position.
   * Uses Manhattan distance (|dx| + |dz|) for detection.
   * 
   * Algorithm:
   * - Iterate through all positions within the radius
   * - For each position, calculate Manhattan distance: |x| + |z|
   * - If distance <= radius and block is water, return true
   * 
   * Validates: Requirements 11.1, 11.4
   * 
   * @param position Position to check
   * @param radius Detection radius in blocks
   * @returns True if water is detected within radius
   */
  hasWaterNearby(position: BlockPosition, radius: number): boolean {
    // Iterate through all positions in the bounding box
    for (let dx = -radius; dx <= radius; dx++) {
      for (let dz = -radius; dz <= radius; dz++) {
        // Calculate Manhattan distance (no diagonal)
        const manhattanDistance = Math.abs(dx) + Math.abs(dz);
        
        // Skip if outside radius
        if (manhattanDistance > radius) {
          continue;
        }
        
        // Check the block at this offset
        const checkPos: BlockPosition = {
          x: position.x + dx,
          y: position.y,
          z: position.z + dz,
          world: position.world,
          chunk: position.chunk
        };
        
        const block = this.world.getBlock(checkPos);
        
        // Check if this block is water
        if (this.isWaterBlock(block.type)) {
          return true;
        }
      }
    }
    
    return false;
  }
  
  /**
   * Check if a block type is water.
   * Can be overridden by subclasses to handle different water types.
   * 
   * @param blockType Block type to check
   * @returns True if the block is water
   */
  protected isWaterBlock(blockType: string): boolean {
    return blockType === 'WATER' || blockType === 'water';
  }
  
  /**
   * Check if it is currently raining at the given position.
   * The position must be exposed to the sky for rain to apply.
   * 
   * Validates: Requirements 12.1, 12.3
   * 
   * @param position Position to check
   * @returns True if raining and position is exposed
   */
  isRaining(position: BlockPosition): boolean {
    // Rain only applies if the crop is exposed to the sky
    if (!this.world.isExposedToSky(position)) {
      return false;
    }
    
    return this.isRainingFlag;
  }
  
  /**
   * Calculate all applicable growth bonuses for the given position.
   * This combines water and rain bonuses.
   * 
   * Validates: Requirements 2.2, 2.3, 11.2, 12.1
   * 
   * @param position Position of the crop
   * @returns Growth bonuses to apply
   */
  calculateBonuses(position: BlockPosition): GrowthBonuses {
    // Check for water bonus
    const hasWater = this.hasWaterNearby(position, this.config.waterDetectionRadius);
    const waterBonus = hasWater ? this.config.waterBonusMultiplier : 1.0;
    
    // Check for rain bonus
    const raining = this.isRaining(position);
    const rainBonus = raining ? this.config.rainBonusMultiplier : 1.0;
    
    return {
      waterBonus,
      rainBonus
    };
  }
}
