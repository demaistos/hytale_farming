import { CropConfig, StageVisual } from './CropConfig';

/**
 * Configuration specific to the Oat crop system.
 * Extends the generic CropConfig with values tailored for oats.
 * 
 * Based on requirements:
 * - 4 growth stages (Germination, Young Sprout, Growth, Maturity)
 * - 4 in-game days to full maturity (96 hours = 345,600 seconds)
 * - Water bonus: +15%, Rain bonus: +10%
 * - Yield: 3-4 grains (80% chance for 4), 1-2 seeds (70% chance for 2)
 * - Fortune increases grain max by level (I: 5, II: 6, III: 7)
 * - Minimum light level: 9
 * - Purchase: 12 Life Essence for 4 seeds
 * - Village loot: 15-20% chance, 2-6 seeds
 * - Grass drop: 5% in Plains biome
 * - Incompatible biomes: Extreme Desert, Frozen Tundra, Nether, End
 */
export class OatSystemConfig implements CropConfig {
  // ===== Growth Configuration =====
  // 4 in-game days = 4 * 24 hours = 96 hours = 96 * 3600 seconds = 345,600 seconds
  baseGrowthTime = 345600;
  
  // Equal distribution across 4 stages (25% each)
  stageDistribution = [0.25, 0.25, 0.25, 0.25];
  
  stageCount = 4;
  
  // ===== Environmental Bonuses =====
  waterBonusMultiplier = 1.15; // +15%
  rainBonusMultiplier = 1.10;  // +10%
  waterDetectionRadius = 4;     // 4 blocks
  
  // ===== Yield Configuration =====
  grainMinBase = 3;
  grainMaxBase = 4;
  grainHighChance = 0.80; // 80% chance for 4 grains
  
  seedMinBase = 1;
  seedMaxBase = 2;
  seedHighChance = 0.70; // 70% chance for 2 seeds
  
  // ===== Fortune Enchantment =====
  // Fortune 0: +0, Fortune I: +1, Fortune II: +2, Fortune III: +3
  fortuneGrainBonus = [0, 1, 2, 3];
  fortuneMinGrains = 4; // Minimum guaranteed with Fortune
  
  // ===== Growth Conditions =====
  minLightLevel = 9;
  validSoilTypes = ['FARMLAND', 'TILLED_SOIL']; // Terre labourée
  
  // ===== Acquisition Configuration =====
  seedPurchasePrice = 12;      // 12 Life Essence
  seedPurchaseQuantity = 4;    // 4 seeds
  
  villageLootChanceMin = 0.15; // 15%
  villageLootChanceMax = 0.20; // 20%
  villageLootQuantityMin = 2;
  villageLootQuantityMax = 6;
  
  grassDropChance = 0.05;      // 5%
  grassDropBiomes = ['PLAINS']; // Only in Plains biome
  
  // ===== Particle Effects =====
  particleCountMin = 3;
  particleCountMax = 5;
  particleIntervalMin = 0.5;   // 0.5 seconds
  particleIntervalMax = 2.0;   // 2.0 seconds
  
  // ===== Biome Restrictions =====
  incompatibleBiomes = [
    'EXTREME_DESERT',
    'FROZEN_TUNDRA',
    'NETHER',
    'END'
  ];
  
  // ===== Visual Configuration =====
  stageVisuals: StageVisual[] = [
    {
      stage: 1,
      color: '#90EE90',      // Lime green
      height: 0.15,
      orientation: 'UPRIGHT'
    },
    {
      stage: 2,
      color: '#228B22',      // Forest green
      height: 0.40,
      orientation: 'UPRIGHT'
    },
    {
      stage: 3,
      color: '#228B22',      // Forest green
      height: 0.70,
      orientation: 'UPRIGHT',
      hasColorTransition: true,
      transitionColor: '#F0E68C' // Pale yellow
    },
    {
      stage: 4,
      color: '#DAA520',      // Golden beige
      height: 0.90,
      heightVariation: 0.10, // Random 0.90-1.00
      orientation: 'DROOPING' // Drooping ears
    }
  ];
}

/**
 * Singleton instance of the Oat system configuration.
 * Use this instance throughout the application for consistency.
 */
export const oatConfig = new OatSystemConfig();
