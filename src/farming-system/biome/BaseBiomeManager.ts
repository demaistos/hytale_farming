import { CropConfig } from '../config';
import { IBiomeManager } from './IBiomeManager';

/**
 * Abstract base class for biome managers.
 * Provides common biome validation logic that can be reused across all crop types.
 * Specific crop biome managers should extend this class.
 * 
 * @template T The crop type this biome manager is for
 */
export abstract class BaseBiomeManager<T> implements IBiomeManager<T> {
  protected config: CropConfig;
  
  /**
   * Create a new biome manager.
   * @param config Configuration for the crop type (contains incompatibleBiomes list)
   */
  constructor(config: CropConfig) {
    this.config = config;
  }
  
  /**
   * Check if a biome is compatible with this crop type.
   * A biome is compatible if it's NOT in the incompatible biomes list.
   * 
   * @param biome The biome identifier to check
   * @returns True if the crop can be planted in this biome
   */
  isCompatibleBiome(biome: string): boolean {
    // A biome is compatible if it's not in the incompatible list
    return !this.config.incompatibleBiomes.includes(biome);
  }
  
  /**
   * Get the list of incompatible biomes for this crop.
   * Returns a copy of the array to prevent external modification.
   * 
   * @returns Array of biome identifiers where this crop cannot be planted
   */
  getIncompatibleBiomes(): string[] {
    // Return a copy to prevent external modification
    return [...this.config.incompatibleBiomes];
  }
}
