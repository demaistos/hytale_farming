import { CropConfig } from '../config';
import { BaseBiomeManager } from './BaseBiomeManager';
import { OatCrop } from '../models/OatCrop';

/**
 * Biome manager specialized for oat crops.
 * 
 * Oats cannot be planted in the following biomes:
 * - EXTREME_DESERT: Too hot and dry
 * - FROZEN_TUNDRA: Too cold
 * - NETHER: Hostile environment
 * - END: Hostile environment
 * 
 * This class uses the standard biome validation from the base class.
 * The incompatible biomes are configured in OatSystemConfig.
 * 
 * If oats needed special biome validation logic (e.g., checking temperature ranges),
 * we could override methods here.
 */
export class OatBiomeManager extends BaseBiomeManager<OatCrop> {
  /**
   * Create a new oat biome manager.
   * @param config Configuration for oat crops (contains incompatibleBiomes list)
   */
  constructor(config: CropConfig) {
    super(config);
  }
  
  /**
   * Oats use the standard biome validation from the base class.
   * The incompatible biomes list is:
   * - EXTREME_DESERT
   * - FROZEN_TUNDRA
   * - NETHER
   * - END
   * 
   * All other biomes are compatible.
   */
}

/**
 * Example of how a different crop might customize biome validation:
 * 
 * export class CactusBiomeManager extends BaseBiomeManager<CactusCrop> {
 *   // Cactus has inverted logic - it ONLY grows in desert biomes
 *   isCompatibleBiome(biome: string): boolean {
 *     const desertBiomes = ['DESERT', 'EXTREME_DESERT', 'MESA'];
 *     return desertBiomes.includes(biome);
 *   }
 * }
 * 
 * export class MushroomBiomeManager extends BaseBiomeManager<MushroomCrop> {
 *   // Mushrooms need dark, humid biomes
 *   isCompatibleBiome(biome: string): boolean {
 *     const darkBiomes = ['DARK_FOREST', 'SWAMP', 'MUSHROOM_ISLAND'];
 *     return darkBiomes.includes(biome);
 *   }
 * }
 */
