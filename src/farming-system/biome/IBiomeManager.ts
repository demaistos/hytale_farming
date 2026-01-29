/**
 * Generic interface for managing biome compatibility for crops.
 * Different crop types may have different biome restrictions.
 * 
 * @template T The crop type this biome manager is for
 */
export interface IBiomeManager<T> {
  /**
   * Check if a biome is compatible with this crop type.
   * 
   * @param biome The biome identifier to check
   * @returns True if the crop can be planted in this biome
   */
  isCompatibleBiome(biome: string): boolean;
  
  /**
   * Get the list of incompatible biomes for this crop.
   * 
   * @returns Array of biome identifiers where this crop cannot be planted
   */
  getIncompatibleBiomes(): string[];
}

/**
 * Mock biome interface for testing and simulation.
 * In a real implementation, this would interface with the game engine.
 */
export interface Biome {
  id: string;
  name: string;
  temperature?: number;
  humidity?: number;
}
