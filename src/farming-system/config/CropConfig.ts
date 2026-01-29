/**
 * Generic configuration for crop systems.
 * This base configuration can be extended for specific crop types.
 * Provides all the parameters needed for growth, yield, and environmental interactions.
 */
export interface CropConfig {
  // ===== Growth Configuration =====
  
  /** Base growth time from planting to full maturity (in seconds) */
  baseGrowthTime: number;
  
  /** Distribution of growth time across stages (should sum to 1.0) */
  stageDistribution: number[];
  
  /** Number of growth stages for this crop */
  stageCount: number;
  
  // ===== Environmental Bonuses =====
  
  /** Multiplier for growth speed when water is nearby (e.g., 1.15 = +15%) */
  waterBonusMultiplier: number;
  
  /** Multiplier for growth speed when raining (e.g., 1.10 = +10%) */
  rainBonusMultiplier: number;
  
  /** Radius for water detection (in blocks) */
  waterDetectionRadius: number;
  
  // ===== Yield Configuration =====
  
  /** Minimum number of primary items (grains/fruits) without Fortune */
  grainMinBase: number;
  
  /** Maximum number of primary items (grains/fruits) without Fortune */
  grainMaxBase: number;
  
  /** Probability of getting the higher grain count (0.0 to 1.0) */
  grainHighChance: number;
  
  /** Minimum number of seeds */
  seedMinBase: number;
  
  /** Maximum number of seeds */
  seedMaxBase: number;
  
  /** Probability of getting the higher seed count (0.0 to 1.0) */
  seedHighChance: number;
  
  // ===== Fortune Enchantment =====
  
  /** Bonus grains per Fortune level [Fortune 0, I, II, III] */
  fortuneGrainBonus: number[];
  
  /** Minimum grains guaranteed when using Fortune */
  fortuneMinGrains: number;
  
  // ===== Growth Conditions =====
  
  /** Minimum light level required for growth (0-15) */
  minLightLevel: number;
  
  /** Block types that are valid soil for this crop */
  validSoilTypes: string[];
  
  // ===== Acquisition Configuration =====
  
  /** Price to purchase seeds (in Life Essence or equivalent currency) */
  seedPurchasePrice: number;
  
  /** Number of seeds received per purchase */
  seedPurchaseQuantity: number;
  
  /** Minimum chance for village loot generation (0.0 to 1.0) */
  villageLootChanceMin: number;
  
  /** Maximum chance for village loot generation (0.0 to 1.0) */
  villageLootChanceMax: number;
  
  /** Minimum seeds in village loot */
  villageLootQuantityMin: number;
  
  /** Maximum seeds in village loot */
  villageLootQuantityMax: number;
  
  /** Chance to drop seeds from grass (0.0 to 1.0) */
  grassDropChance: number;
  
  /** Biomes where grass can drop seeds */
  grassDropBiomes: string[];
  
  // ===== Particle Effects =====
  
  /** Minimum number of particles per spawn */
  particleCountMin: number;
  
  /** Maximum number of particles per spawn */
  particleCountMax: number;
  
  /** Minimum interval between particle spawns (in seconds) */
  particleIntervalMin: number;
  
  /** Maximum interval between particle spawns (in seconds) */
  particleIntervalMax: number;
  
  // ===== Biome Restrictions =====
  
  /** List of biomes where this crop cannot be planted */
  incompatibleBiomes: string[];
  
  // ===== Visual Configuration =====
  
  /** Visual properties for each growth stage */
  stageVisuals: StageVisual[];
}

/**
 * Visual properties for a specific growth stage.
 */
export interface StageVisual {
  /** Growth stage number (1-based) */
  stage: number;
  
  /** Color in hex format (e.g., "#90EE90") */
  color: string;
  
  /** Height of the crop at this stage (in blocks) */
  height: number;
  
  /** Maximum height variation (for randomization) */
  heightVariation?: number;
  
  /** Orientation of the crop (e.g., "UPRIGHT", "DROOPING") */
  orientation?: string;
  
  /** Whether this stage has a color transition */
  hasColorTransition?: boolean;
  
  /** Target color for transition (if hasColorTransition is true) */
  transitionColor?: string;
}
