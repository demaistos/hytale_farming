import { ICropSystem } from '../system';
import { ICrop, BlockPosition, ChunkCoordinates } from '../interfaces';
import { PlantResult, HarvestEvent } from '../types';

/**
 * Registry for managing multiple crop types.
 * 
 * The CropRegistry provides a centralized system for:
 * - Registering different crop types (oats, wheat, corn, tomatoes, etc.)
 * - Routing game events to the appropriate crop system
 * - Managing all crops uniformly through a single interface
 * - Enabling easy addition of new crops without modifying existing code
 * 
 * Architecture:
 * - Maps crop type identifiers to their systems
 * - Maps item IDs (seeds) to crop types
 * - Maps block positions to crop types for efficient lookup
 * - Delegates all operations to the appropriate crop system
 * 
 * Usage:
 * ```typescript
 * const registry = new CropRegistry();
 * 
 * // Register crop systems
 * registry.registerCropSystem('oat', oatSystem, 'oat_seed');
 * registry.registerCropSystem('wheat', wheatSystem, 'wheat_seed');
 * 
 * // Plant a seed (automatically routes to correct system)
 * const result = registry.plantSeed('oat_seed', position, player);
 * 
 * // Harvest a crop (automatically detects crop type)
 * const harvest = registry.harvestCrop(position, player, fortuneLevel);
 * 
 * // Update all crops (updates all registered systems)
 * registry.onTick(deltaTime);
 * ```
 * 
 * Validates: Requirements 14.1 - Integration with game engine
 */
export class CropRegistry {
  /** Map of crop type to crop system */
  private systems: Map<string, ICropSystem<any>> = new Map();
  
  /** Map of seed item ID to crop type */
  private seedToCropType: Map<string, string> = new Map();
  
  /** Map of position key to crop type for efficient lookup */
  private positionToCropType: Map<string, string> = new Map();
  
  /**
   * Register a crop system with the registry.
   * 
   * @param cropType Unique identifier for this crop type (e.g., 'oat', 'wheat')
   * @param system The crop system instance
   * @param seedItemId The item ID for this crop's seeds (e.g., 'oat_seed')
   */
  registerCropSystem(cropType: string, system: ICropSystem<any>, seedItemId: string): void {
    if (this.systems.has(cropType)) {
      console.warn(`Crop type '${cropType}' is already registered. Overwriting.`);
    }
    
    this.systems.set(cropType, system);
    this.seedToCropType.set(seedItemId, cropType);
    
    console.log(`Registered crop system: ${cropType} (seed: ${seedItemId})`);
  }
  
  /**
   * Unregister a crop system from the registry.
   * 
   * @param cropType Crop type to unregister
   * @returns True if the system was unregistered, false if it wasn't registered
   */
  unregisterCropSystem(cropType: string): boolean {
    const system = this.systems.get(cropType);
    if (!system) {
      return false;
    }
    
    // Remove from systems map
    this.systems.delete(cropType);
    
    // Remove seed mapping
    for (const [seedId, type] of this.seedToCropType.entries()) {
      if (type === cropType) {
        this.seedToCropType.delete(seedId);
      }
    }
    
    // Remove position mappings
    for (const [posKey, type] of this.positionToCropType.entries()) {
      if (type === cropType) {
        this.positionToCropType.delete(posKey);
      }
    }
    
    console.log(`Unregistered crop system: ${cropType}`);
    return true;
  }
  
  /**
   * Get a registered crop system by type.
   * 
   * @param cropType Crop type identifier
   * @returns The crop system, or undefined if not registered
   */
  getCropSystem(cropType: string): ICropSystem<any> | undefined {
    return this.systems.get(cropType);
  }
  
  /**
   * Get all registered crop types.
   * 
   * @returns Array of crop type identifiers
   */
  getRegisteredCropTypes(): string[] {
    return Array.from(this.systems.keys());
  }
  
  /**
   * Check if a crop type is registered.
   * 
   * @param cropType Crop type to check
   * @returns True if registered, false otherwise
   */
  isCropTypeRegistered(cropType: string): boolean {
    return this.systems.has(cropType);
  }
  
  /**
   * Get the crop type for a seed item ID.
   * 
   * @param seedItemId Seed item ID
   * @returns Crop type, or undefined if not registered
   */
  getCropTypeForSeed(seedItemId: string): string | undefined {
    return this.seedToCropType.get(seedItemId);
  }
  
  /**
   * Plant a seed at the specified position.
   * Automatically routes to the correct crop system based on seed item ID.
   * 
   * @param seedItemId The seed item being planted
   * @param position Position to plant the seed
   * @param player Player planting the seed (optional)
   * @returns Result indicating success or failure reason
   */
  plantSeed(seedItemId: string, position: BlockPosition, player?: any): PlantResult {
    const cropType = this.seedToCropType.get(seedItemId);
    
    if (!cropType) {
      return {
        success: false,
        reason: 'UNKNOWN_SEED' as any
      };
    }
    
    const system = this.systems.get(cropType);
    if (!system) {
      console.error(`Crop system not found for type: ${cropType}`);
      return {
        success: false,
        reason: 'SYSTEM_ERROR' as any
      };
    }
    
    // Plant the seed using the appropriate system
    const result = system.plantSeed(position, player);
    
    // If successful, track the position
    if (result.success) {
      const posKey = this.getPositionKey(position);
      this.positionToCropType.set(posKey, cropType);
    }
    
    return result;
  }
  
  /**
   * Get the crop at the specified position.
   * Automatically detects the crop type and routes to the correct system.
   * 
   * @param position Position to check
   * @returns The crop instance if present, null otherwise
   */
  getCrop(position: BlockPosition): ICrop | null {
    const posKey = this.getPositionKey(position);
    const cropType = this.positionToCropType.get(posKey);
    
    if (!cropType) {
      return null;
    }
    
    const system = this.systems.get(cropType);
    if (!system) {
      console.error(`Crop system not found for type: ${cropType}`);
      return null;
    }
    
    return system.getCrop(position);
  }
  
  /**
   * Remove a crop from the specified position.
   * Automatically detects the crop type and routes to the correct system.
   * 
   * @param position Position of the crop to remove
   * @returns True if a crop was removed, false if no crop existed
   */
  removeCrop(position: BlockPosition): boolean {
    const posKey = this.getPositionKey(position);
    const cropType = this.positionToCropType.get(posKey);
    
    if (!cropType) {
      return false;
    }
    
    const system = this.systems.get(cropType);
    if (!system) {
      console.error(`Crop system not found for type: ${cropType}`);
      return false;
    }
    
    const removed = system.removeCrop(position);
    
    if (removed) {
      this.positionToCropType.delete(posKey);
    }
    
    return removed;
  }
  
  /**
   * Harvest a crop at the specified position.
   * Automatically detects the crop type and routes to the correct system.
   * 
   * @param position Position of the crop to harvest
   * @param player Player harvesting the crop
   * @param fortuneLevel Fortune enchantment level (0-3)
   * @returns Harvest event with yield information, or null if no crop exists
   */
  harvestCrop(position: BlockPosition, player: any, fortuneLevel: number = 0): HarvestEvent | null {
    const posKey = this.getPositionKey(position);
    const cropType = this.positionToCropType.get(posKey);
    
    if (!cropType) {
      return null;
    }
    
    const system = this.systems.get(cropType);
    if (!system) {
      console.error(`Crop system not found for type: ${cropType}`);
      return null;
    }
    
    const harvestEvent = system.onPlantHarvested(position, player, fortuneLevel);
    
    // Remove position tracking if harvest was successful
    if (harvestEvent) {
      this.positionToCropType.delete(posKey);
    }
    
    return harvestEvent;
  }
  
  /**
   * Update all active crops across all registered systems.
   * Called once per game tick to advance growth.
   * 
   * @param deltaTime Time elapsed since last tick (in seconds)
   */
  onTick(deltaTime: number): void {
    for (const [cropType, system] of this.systems.entries()) {
      try {
        system.onTick(deltaTime);
      } catch (error) {
        console.error(`Error updating crop system '${cropType}':`, error);
      }
    }
  }
  
  /**
   * Handle chunk load event for all registered systems.
   * Restores all crops in the chunk from persistent storage.
   * 
   * @param chunk Chunk coordinates being loaded
   */
  async onChunkLoad(chunk: ChunkCoordinates): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [cropType, system] of this.systems.entries()) {
      promises.push(
        system.onChunkLoad(chunk).catch(error => {
          console.error(`Error loading chunk for crop system '${cropType}':`, error);
        })
      );
    }
    
    await Promise.all(promises);
    
    // Rebuild position tracking for loaded crops
    this.rebuildPositionTracking();
  }
  
  /**
   * Handle chunk unload event for all registered systems.
   * Saves all crops in the chunk to persistent storage.
   * 
   * @param chunk Chunk coordinates being unloaded
   */
  async onChunkUnload(chunk: ChunkCoordinates): Promise<void> {
    const promises: Promise<void>[] = [];
    
    for (const [cropType, system] of this.systems.entries()) {
      promises.push(
        system.onChunkUnload(chunk).catch(error => {
          console.error(`Error unloading chunk for crop system '${cropType}':`, error);
        })
      );
    }
    
    await Promise.all(promises);
    
    // Clean up position tracking for unloaded crops
    this.cleanupPositionTracking(chunk);
  }
  
  /**
   * Get all active crops across all registered systems.
   * 
   * @returns Array of all crop instances
   */
  getAllCrops(): ICrop[] {
    const allCrops: ICrop[] = [];
    
    for (const system of this.systems.values()) {
      allCrops.push(...system.getAllCrops());
    }
    
    return allCrops;
  }
  
  /**
   * Get the total number of active crops across all systems.
   * 
   * @returns Total count of active crops
   */
  getTotalCropCount(): number {
    let total = 0;
    
    for (const system of this.systems.values()) {
      total += system.getCropCount();
    }
    
    return total;
  }
  
  /**
   * Get crop counts by type.
   * 
   * @returns Map of crop type to count
   */
  getCropCountsByType(): Map<string, number> {
    const counts = new Map<string, number>();
    
    for (const [cropType, system] of this.systems.entries()) {
      counts.set(cropType, system.getCropCount());
    }
    
    return counts;
  }
  
  /**
   * Rebuild position tracking from all registered systems.
   * Used after chunk loads to ensure position map is accurate.
   */
  private rebuildPositionTracking(): void {
    for (const [cropType, system] of this.systems.entries()) {
      const crops = system.getAllCrops();
      
      for (const crop of crops) {
        const posKey = this.getPositionKey(crop.position);
        this.positionToCropType.set(posKey, cropType);
      }
    }
  }
  
  /**
   * Clean up position tracking for unloaded chunks.
   * 
   * @param chunk Chunk coordinates that were unloaded
   */
  private cleanupPositionTracking(chunk: ChunkCoordinates): void {
    const keysToDelete: string[] = [];
    
    for (const [posKey, cropType] of this.positionToCropType.entries()) {
      // Parse position key to check if it's in the unloaded chunk
      const parts = posKey.split(':');
      if (parts.length >= 4) {
        const x = parseInt(parts[1]);
        const z = parseInt(parts[3]);
        
        // Calculate chunk coordinates from position
        const chunkX = Math.floor(x / 16);
        const chunkZ = Math.floor(z / 16);
        
        if (chunkX === chunk.chunkX && chunkZ === chunk.chunkZ) {
          keysToDelete.push(posKey);
        }
      }
    }
    
    for (const key of keysToDelete) {
      this.positionToCropType.delete(key);
    }
  }
  
  /**
   * Generate a unique position key.
   * Format: "world:x:y:z"
   * 
   * @param position Position to convert
   * @returns Position key string
   */
  private getPositionKey(position: BlockPosition): string {
    return `${position.world}:${position.x}:${position.y}:${position.z}`;
  }
}
