import { ICropYield, HarvestYield } from '../interfaces';

/**
 * Generic interface for yield calculation.
 * Extends ICropYield with additional configuration methods.
 * 
 * @template T The specific crop type
 */
export interface IYieldCalculator<T> extends ICropYield<T> {
  /**
   * Get the configuration for this yield calculator.
   * @returns The yield configuration object
   */
  getConfig(): YieldConfig;
}

/**
 * Configuration for yield calculation.
 * Defines the probabilistic rules for generating harvest rewards.
 */
export interface YieldConfig {
  /** Minimum number of primary items (grains/fruits) for mature crops */
  primaryMinBase: number;
  
  /** Maximum number of primary items (grains/fruits) for mature crops */
  primaryMaxBase: number;
  
  /** Probability of getting the higher count (0.0 to 1.0) */
  primaryHighChance: number;
  
  /** Minimum number of seeds for mature crops */
  seedMinBase: number;
  
  /** Maximum number of seeds for mature crops */
  seedMaxBase: number;
  
  /** Probability of getting the higher seed count (0.0 to 1.0) */
  seedHighChance: number;
  
  /** Bonus to maximum primary items per Fortune level [0, I, II, III] */
  fortunePrimaryBonus: number[];
  
  /** Minimum guaranteed primary items when Fortune is active */
  fortuneMinPrimary: number;
  
  /** Whether Fortune affects seed drops */
  fortuneAffectsSeeds: boolean;
  
  /** Number of seeds dropped for immature crops */
  immatureSeedCount: number;
  
  /** The stage number considered "mature" for full yield */
  matureStage: number;
}

