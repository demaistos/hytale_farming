/**
 * Generic interface for rendering crops at different growth stages
 * @template T The crop type
 */
export interface IRenderEngine<T> {
  /**
   * Get the visual properties for a specific growth stage
   * @param stage The growth stage (1-4)
   * @returns Visual properties including color, height, and orientation
   */
  getStageVisuals(stage: number): StageVisuals;

  /**
   * Render a crop at its current position
   * @param crop The crop to render
   * @param position The position to render at
   */
  renderCrop(crop: T, position: BlockPosition): void;

  /**
   * Update the visual representation of a crop
   * @param crop The crop to update
   */
  updateCropVisuals(crop: T): void;
}

/**
 * Visual properties for a crop at a specific growth stage
 */
export interface StageVisuals {
  /** Hex color code (e.g., "#90EE90") */
  color: string;
  /** Height in blocks (0.0 - 1.0) */
  height: number;
  /** Orientation of the crop (UPRIGHT or DROOPING) */
  orientation: Orientation;
  /** Optional gradient end color for transitions */
  gradientEndColor?: string;
}

/**
 * Orientation of crop ears/heads
 */
export enum Orientation {
  UPRIGHT = "UPRIGHT",
  DROOPING = "DROOPING"
}

/**
 * Block position in the world
 */
export interface BlockPosition {
  x: number;
  y: number;
  z: number;
  world?: string;
}
