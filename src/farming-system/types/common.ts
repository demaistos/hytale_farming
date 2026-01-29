/**
 * Common types and enums used throughout the farming system.
 */

/**
 * Growth stages for crops.
 * Note: Specific crops may have different stage counts.
 * For oats: 1 = Germination, 2 = Young Sprout, 3 = Growth, 4 = Maturity
 */
export enum GrowthStage {
  GERMINATION = 1,
  YOUNG_SPROUT = 2,
  GROWTH = 3,
  MATURITY = 4
}

/**
 * Orientation of crop visual elements.
 */
export enum Orientation {
  UPRIGHT = 'UPRIGHT',
  DROOPING = 'DROOPING'
}

/**
 * Result of a planting attempt.
 */
export type PlantResult = 
  | { success: true; crop: any }
  | { success: false; reason: PlantFailureReason };

/**
 * Reasons why planting might fail.
 */
export enum PlantFailureReason {
  INVALID_SOIL = 'INVALID_SOIL',
  INVALID_BIOME = 'INVALID_BIOME',
  OBSTRUCTED_SPACE = 'OBSTRUCTED_SPACE',
  ALREADY_PLANTED = 'ALREADY_PLANTED',
  INSUFFICIENT_LIGHT = 'INSUFFICIENT_LIGHT'
}

/**
 * Result of a purchase attempt.
 */
export interface PurchaseResult {
  success: boolean;
  seedsReceived?: number;
  reason?: string;
}

/**
 * Types of crop-related events.
 */
export enum CropEventType {
  PLANTED = 'PLANTED',
  STAGE_ADVANCED = 'STAGE_ADVANCED',
  HARVESTED = 'HARVESTED',
  DESTROYED = 'DESTROYED',
  GROWTH_BLOCKED = 'GROWTH_BLOCKED'
}

/**
 * Base crop event structure.
 */
export interface CropEvent {
  type: CropEventType;
  crop: any;
  timestamp: number;
}

/**
 * Harvest event with yield information.
 */
export interface HarvestEvent extends CropEvent {
  type: CropEventType.HARVESTED;
  yield: any;
  fortuneLevel: number;
  player?: any;
}

/**
 * Validation result for conditions.
 */
export interface ValidationResult {
  valid: boolean;
  reason?: string;
}

/**
 * Color representation.
 */
export interface Color {
  hex: string;
  r: number;
  g: number;
  b: number;
}

/**
 * Convert hex color to RGB components.
 * @param hex Hex color string (e.g., "#90EE90")
 * @returns Color object with RGB values
 */
export function hexToRgb(hex: string): Color {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  if (!result) {
    throw new Error(`Invalid hex color: ${hex}`);
  }
  return {
    hex,
    r: parseInt(result[1], 16),
    g: parseInt(result[2], 16),
    b: parseInt(result[3], 16)
  };
}

/**
 * Item drop from breaking blocks.
 */
export interface ItemDrop {
  itemType: string;
  quantity: number;
}
