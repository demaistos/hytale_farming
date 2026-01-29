import { ICrop, BlockPosition, ChunkCoordinates } from '../interfaces';
import { PlantResult, HarvestEvent } from '../types';

/**
 * Generic interface for crop management systems.
 * 
 * A crop system orchestrates all components needed to manage a specific crop type:
 * - Growth engine for temporal progression
 * - Yield calculator for harvest rewards
 * - Condition validator for planting and growth requirements
 * - Biome manager for location restrictions
 * - Bonus calculator for environmental modifiers
 * - Render engine for visual representation
 * - Particle manager for visual effects
 * - Persistence manager for save/load operations
 * 
 * This interface defines the contract that all crop systems must implement,
 * enabling polymorphic handling of different crop types.
 * 
 * @template T The specific crop type (e.g., OatCrop, WheatCrop)
 */
export interface ICropSystem<T extends ICrop> {
  /**
   * Plant a seed at the specified position.
   * 
   * Validates:
   * - Soil type is appropriate for this crop
   * - Biome is compatible
   * - Space above is clear
   * - Position is not already occupied
   * 
   * @param position Position to plant the seed
   * @param player Player planting the seed (optional)
   * @returns Result indicating success or failure reason
   */
  plantSeed(position: BlockPosition, player?: any): PlantResult;
  
  /**
   * Get the crop at the specified position.
   * 
   * @param position Position to check
   * @returns The crop instance if present, null otherwise
   */
  getCrop(position: BlockPosition): T | null;
  
  /**
   * Remove a crop from the specified position.
   * Does not generate any yield - use onPlantHarvested for that.
   * 
   * @param position Position of the crop to remove
   * @returns True if a crop was removed, false if no crop existed
   */
  removeCrop(position: BlockPosition): boolean;
  
  /**
   * Update all active crops.
   * Called once per game tick to advance growth.
   * 
   * For each crop:
   * - Checks growth conditions (light, space)
   * - Calculates environmental bonuses (water, rain)
   * - Updates growth progress
   * - Advances stage if threshold reached
   * - Updates visual rendering
   * 
   * @param deltaTime Time elapsed since last tick (in seconds)
   */
  onTick(deltaTime: number): void;
  
  /**
   * Handle crop harvest event.
   * 
   * - Calculates yield based on crop stage
   * - Applies Fortune enchantment if present
   * - Removes crop from world
   * - Adds items to player inventory
   * - Emits harvest event
   * 
   * @param position Position of the crop to harvest
   * @param player Player harvesting the crop
   * @param fortuneLevel Fortune enchantment level (0-3)
   * @returns Harvest event with yield information
   */
  onPlantHarvested(position: BlockPosition, player: any, fortuneLevel: number): HarvestEvent | null;
  
  /**
   * Handle chunk load event.
   * Restores all crops in the chunk from persistent storage.
   * 
   * @param chunk Chunk coordinates being loaded
   */
  onChunkLoad(chunk: ChunkCoordinates): Promise<void>;
  
  /**
   * Handle chunk unload event.
   * Saves all crops in the chunk to persistent storage.
   * 
   * @param chunk Chunk coordinates being unloaded
   */
  onChunkUnload(chunk: ChunkCoordinates): Promise<void>;
  
  /**
   * Get all active crops in the system.
   * Useful for debugging and statistics.
   * 
   * @returns Array of all crop instances
   */
  getAllCrops(): T[];
  
  /**
   * Get the number of active crops.
   * 
   * @returns Count of active crops
   */
  getCropCount(): number;
}
