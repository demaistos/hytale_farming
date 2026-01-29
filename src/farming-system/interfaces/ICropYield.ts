/**
 * Generic interface for crop yield calculation.
 * Handles the generation of harvest rewards based on crop state and enchantments.
 * 
 * @template T The specific crop type
 */
export interface ICropYield<T> {
  /**
   * Calculate the yield for harvesting a crop.
   * @param crop The crop being harvested
   * @param fortuneLevel The Fortune enchantment level (0-3)
   * @returns The harvest yield containing all items
   */
  calculateYield(crop: T, fortuneLevel: number): HarvestYield;
  
  /**
   * Calculate the count of a specific item type.
   * @param stage The growth stage of the crop
   * @param fortuneLevel The Fortune enchantment level
   * @param itemType The type of item being calculated
   * @returns The number of items to drop
   */
  calculateItemCount(stage: number, fortuneLevel: number, itemType: string): number;
}

/**
 * Result of harvesting a crop.
 * Contains all items that should be dropped.
 */
export interface HarvestYield {
  /** Number of primary crop items (e.g., grains, fruits) */
  grains: number;
  
  /** Number of seeds for replanting */
  seeds: number;
  
  /** Additional items specific to the crop type */
  [key: string]: number;
}
