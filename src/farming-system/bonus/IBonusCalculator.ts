import { BlockPosition } from '../interfaces';

/**
 * Growth bonuses that can be applied to crop growth.
 * Bonuses are represented as multipliers (e.g., 1.15 = +15% growth speed).
 */
export interface GrowthBonuses {
  /** Water bonus multiplier (1.0 = no bonus, 1.15 = +15% bonus) */
  waterBonus: number;
  
  /** Rain bonus multiplier (1.0 = no bonus, 1.10 = +10% bonus) */
  rainBonus: number;
}

/**
 * Generic interface for calculating environmental growth bonuses.
 * Different crop types may have different bonus calculations.
 * 
 * @template T The crop type this calculator is for
 */
export interface IBonusCalculator<T> {
  /**
   * Check if there is water nearby the given position.
   * Uses Manhattan distance (not diagonal) for detection.
   * 
   * @param position Position to check
   * @param radius Detection radius in blocks
   * @returns True if water is detected within radius
   */
  hasWaterNearby(position: BlockPosition, radius: number): boolean;
  
  /**
   * Check if it is currently raining at the given position.
   * The position must be exposed to the sky for rain to apply.
   * 
   * @param position Position to check
   * @returns True if raining and position is exposed
   */
  isRaining(position: BlockPosition): boolean;
  
  /**
   * Calculate all applicable growth bonuses for the given position.
   * This combines water and rain bonuses.
   * 
   * @param position Position of the crop
   * @returns Growth bonuses to apply
   */
  calculateBonuses(position: BlockPosition): GrowthBonuses;
}
