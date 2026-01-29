import { IYieldCalculator, YieldConfig } from './IYieldCalculator';
import { HarvestYield } from '../interfaces';

/**
 * Base implementation of yield calculation logic.
 * Provides generic probabilistic yield generation that can be specialized for different crops.
 * 
 * This class implements the core algorithm for:
 * - Generating random item counts based on probability distributions
 * - Applying Fortune enchantment bonuses
 * - Handling immature crop harvesting
 * - Combining multiple item types into a single yield
 * 
 * @template T The specific crop type
 */
export abstract class BaseYieldCalculator<T> implements IYieldCalculator<T> {
  protected config: YieldConfig;
  
  /**
   * Create a new yield calculator with the given configuration.
   * @param config The yield configuration
   */
  constructor(config: YieldConfig) {
    this.config = config;
  }
  
  /**
   * Get the configuration for this yield calculator.
   * @returns The yield configuration object
   */
  getConfig(): YieldConfig {
    return this.config;
  }
  
  /**
   * Calculate the yield for harvesting a crop.
   * Combines primary items (grains/fruits) and seeds based on crop stage and Fortune level.
   * 
   * @param crop The crop being harvested
   * @param fortuneLevel The Fortune enchantment level (0-3)
   * @returns The harvest yield containing all items
   */
  calculateYield(crop: T, fortuneLevel: number): HarvestYield {
    const stage = this.getCropStage(crop);
    
    // Calculate grains/fruits
    const grains = this.calculateItemCount(stage, fortuneLevel, 'primary');
    
    // Calculate seeds (Fortune doesn't affect seeds for most crops)
    const seeds = this.calculateItemCount(stage, 0, 'seed');
    
    return {
      grains,
      seeds
    };
  }
  
  /**
   * Calculate the count of a specific item type.
   * Implements the probabilistic logic for generating item counts.
   * 
   * For mature crops:
   * - Without Fortune: Uses base min/max with probability distribution
   * - With Fortune: Increases maximum and guarantees minimum
   * 
   * For immature crops:
   * - Primary items: 0
   * - Seeds: Fixed count (usually 1)
   * 
   * @param stage The growth stage of the crop
   * @param fortuneLevel The Fortune enchantment level (0-3)
   * @param itemType The type of item being calculated ('primary' or 'seed')
   * @returns The number of items to drop
   */
  calculateItemCount(stage: number, fortuneLevel: number, itemType: string): number {
    // Handle immature crops
    if (stage < this.config.matureStage) {
      if (itemType === 'primary') {
        return 0;
      } else if (itemType === 'seed') {
        return this.config.immatureSeedCount;
      }
      return 0;
    }
    
    // Handle mature crops
    if (itemType === 'primary') {
      return this.calculatePrimaryItemCount(fortuneLevel);
    } else if (itemType === 'seed') {
      return this.calculateSeedCount(fortuneLevel);
    }
    
    return 0;
  }
  
  /**
   * Calculate the count of primary items (grains/fruits).
   * Applies Fortune bonuses if applicable.
   * 
   * @param fortuneLevel The Fortune enchantment level (0-3)
   * @returns The number of primary items
   */
  protected calculatePrimaryItemCount(fortuneLevel: number): number {
    if (fortuneLevel === 0) {
      // No Fortune: use base probability
      const random = Math.random();
      return random < this.config.primaryHighChance 
        ? this.config.primaryMaxBase 
        : this.config.primaryMinBase;
    } else {
      // With Fortune: increase max and guarantee minimum
      const bonus = this.config.fortunePrimaryBonus[fortuneLevel] || 0;
      const max = this.config.primaryMaxBase + bonus;
      const min = this.config.fortuneMinPrimary;
      
      // Uniform distribution between min and max (inclusive)
      return this.randomInt(min, max);
    }
  }
  
  /**
   * Calculate the count of seeds.
   * Fortune typically doesn't affect seed drops.
   * 
   * @param fortuneLevel The Fortune enchantment level (0-3)
   * @returns The number of seeds
   */
  protected calculateSeedCount(fortuneLevel: number): number {
    // Check if Fortune affects seeds (usually it doesn't)
    if (this.config.fortuneAffectsSeeds && fortuneLevel > 0) {
      // Custom logic for crops where Fortune affects seeds
      const bonus = this.config.fortunePrimaryBonus[fortuneLevel] || 0;
      const max = this.config.seedMaxBase + bonus;
      return this.randomInt(this.config.seedMinBase, max);
    } else {
      // Standard seed calculation with probability
      const random = Math.random();
      return random < this.config.seedHighChance 
        ? this.config.seedMaxBase 
        : this.config.seedMinBase;
    }
  }
  
  /**
   * Generate a random integer between min and max (inclusive).
   * Uses uniform distribution.
   * 
   * @param min Minimum value (inclusive)
   * @param max Maximum value (inclusive)
   * @returns Random integer in range [min, max]
   */
  protected randomInt(min: number, max: number): number {
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Get the growth stage of a crop.
   * Must be implemented by subclasses to extract stage from crop-specific structure.
   * 
   * @param crop The crop instance
   * @returns The current growth stage
   */
  protected abstract getCropStage(crop: T): number;
}

