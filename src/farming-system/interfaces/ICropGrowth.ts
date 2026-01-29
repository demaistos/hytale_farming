/**
 * Generic interface for crop growth management.
 * Handles the progression of crops through their growth stages.
 * 
 * @template T The specific crop type
 */
export interface ICropGrowth<T> {
  /**
   * Update the growth of a crop based on elapsed time and environmental bonuses.
   * @param crop The crop to update
   * @param deltaTime Time elapsed since last update (in seconds)
   * @param bonuses Environmental growth bonuses
   */
  updateGrowth(crop: T, deltaTime: number, bonuses: GrowthBonuses): void;
  
  /**
   * Check if a crop can currently grow based on environmental conditions.
   * @param crop The crop to check
   * @returns True if the crop can grow, false otherwise
   */
  canGrow(crop: T): boolean;
  
  /**
   * Calculate the progress for the current stage.
   * @param crop The crop to calculate progress for
   * @param deltaTime Time elapsed (in seconds)
   * @param bonuses Environmental growth bonuses
   * @returns The progress amount to add to the current stage
   */
  calculateStageProgress(crop: T, deltaTime: number, bonuses: GrowthBonuses): number;
  
  /**
   * Check if the crop should advance to the next stage.
   * @param crop The crop to check
   * @returns True if the crop should advance, false otherwise
   */
  shouldAdvanceStage(crop: T): boolean;
  
  /**
   * Advance the crop to the next growth stage.
   * @param crop The crop to advance
   */
  advanceStage(crop: T): void;
}

/**
 * Environmental bonuses that affect growth speed.
 */
export interface GrowthBonuses {
  /** Water bonus multiplier (1.0 = no bonus, 1.15 = +15% with water) */
  waterBonus: number;
  
  /** Rain bonus multiplier (1.0 = no bonus, 1.10 = +10% with rain) */
  rainBonus: number;
}
