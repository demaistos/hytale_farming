import { BlockPosition } from '../interfaces';
import { ValidationResult } from '../types';

/**
 * Generic interface for validating crop planting and growth conditions.
 * Different crop types can have different soil requirements, light needs, etc.
 * 
 * @template T The crop type this validator is for
 */
export interface IConditionValidator<T> {
  /**
   * Check if a crop can be planted at the given position.
   * This combines all planting validations: soil, space, biome, etc.
   * 
   * @param position Position where planting is attempted
   * @returns Validation result with reason if invalid
   */
  canPlant(position: BlockPosition): ValidationResult;
  
  /**
   * Check if the soil at the given position is valid for this crop.
   * Different crops may require different soil types.
   * For example: oats need tilled soil, rice needs water-adjacent soil.
   * 
   * @param position Position to check
   * @returns True if soil is valid
   */
  isValidSoil(position: BlockPosition): boolean;
  
  /**
   * Check if there is free space above the position for the crop to grow.
   * This is reusable for all crops as they all need vertical space.
   * 
   * @param position Position to check
   * @returns True if space is available
   */
  hasSpaceAbove(position: BlockPosition): boolean;
  
  /**
   * Check if a crop can continue growing at the given position.
   * This checks conditions like light level and space.
   * 
   * @param position Position of the crop
   * @returns Validation result with reason if growth is blocked
   */
  canGrow(position: BlockPosition): ValidationResult;
  
  /**
   * Get the light level at the given position.
   * 
   * @param position Position to check
   * @returns Light level (0-15)
   */
  getLightLevel(position: BlockPosition): number;
  
  /**
   * Check if the position is exposed to the sky.
   * This is used for rain bonus calculations.
   * 
   * @param position Position to check
   * @returns True if exposed to sky
   */
  isExposedToSky(position: BlockPosition): boolean;
}

/**
 * Mock block interface for testing and simulation.
 * In a real implementation, this would interface with the game engine.
 */
export interface Block {
  type: string;
  position: BlockPosition;
}

/**
 * Mock world interface for accessing blocks.
 * In a real implementation, this would interface with the game engine.
 */
export interface IWorld {
  /**
   * Get the block at the given position.
   * @param position Position to query
   * @returns The block at that position
   */
  getBlock(position: BlockPosition): Block;
  
  /**
   * Get the light level at the given position.
   * @param position Position to query
   * @returns Light level (0-15)
   */
  getLightLevel(position: BlockPosition): number;
  
  /**
   * Check if a position is exposed to the sky.
   * @param position Position to query
   * @returns True if exposed to sky
   */
  isExposedToSky(position: BlockPosition): boolean;
  
  /**
   * Get the biome at the given position.
   * @param position Position to query
   * @returns Biome identifier (e.g., "PLAINS", "FOREST", "DESERT")
   */
  getBiome(position: BlockPosition): string;
}
