import { BaseYieldCalculator } from './BaseYieldCalculator';
import { YieldConfig } from './IYieldCalculator';
import { OatCrop } from '../models';
import { oatConfig } from '../config';

/**
 * Yield calculator specialized for oat crops.
 * 
 * Oat yield specifications:
 * - Mature (stage 4): 3-4 grains (80% chance for 4, 20% for 3)
 * - Mature (stage 4): 1-2 seeds (70% chance for 2, 30% for 1)
 * - Immature (stages 1-3): 0 grains, 1 seed
 * - Fortune I: max 5 grains, min 4
 * - Fortune II: max 6 grains, min 4
 * - Fortune III: max 7 grains, min 4
 * - Fortune does NOT affect seeds
 * 
 * Based on requirements 4.1-4.5 and 5.1-5.5.
 */
export class OatYieldCalculator extends BaseYieldCalculator<OatCrop> {
  /**
   * Create a new oat yield calculator.
   * Initializes with oat-specific yield configuration.
   */
  constructor() {
    super(OatYieldCalculator.createOatYieldConfig());
  }
  
  /**
   * Create the yield configuration for oats.
   * Maps the oat system config to the generic yield config structure.
   * 
   * @returns Yield configuration for oats
   */
  private static createOatYieldConfig(): YieldConfig {
    return {
      primaryMinBase: oatConfig.grainMinBase,           // 3
      primaryMaxBase: oatConfig.grainMaxBase,           // 4
      primaryHighChance: oatConfig.grainHighChance,     // 0.80 (80%)
      
      seedMinBase: oatConfig.seedMinBase,               // 1
      seedMaxBase: oatConfig.seedMaxBase,               // 2
      seedHighChance: oatConfig.seedHighChance,         // 0.70 (70%)
      
      fortunePrimaryBonus: oatConfig.fortuneGrainBonus, // [0, 1, 2, 3]
      fortuneMinPrimary: oatConfig.fortuneMinGrains,    // 4
      fortuneAffectsSeeds: false,                       // Fortune doesn't affect seeds
      
      immatureSeedCount: 1,                             // 1 seed for immature crops
      matureStage: 4                                    // Stage 4 is mature
    };
  }
  
  /**
   * Get the growth stage of an oat crop.
   * @param crop The oat crop instance
   * @returns The current growth stage (1-4)
   */
  protected getCropStage(crop: OatCrop): number {
    return crop.stage;
  }
}

