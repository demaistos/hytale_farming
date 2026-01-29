import { IRenderEngine, StageVisuals, Orientation, BlockPosition } from './IRenderEngine';

/**
 * Base implementation of the render engine with common rendering logic
 * @template T The crop type
 */
export abstract class BaseRenderEngine<T> implements IRenderEngine<T> {
  /**
   * Get the visual properties for a specific growth stage
   * Must be implemented by subclasses to provide crop-specific visuals
   */
  abstract getStageVisuals(stage: number): StageVisuals;

  /**
   * Render a crop at its current position
   * Applies the visual properties based on the crop's growth stage
   */
  renderCrop(crop: T, position: BlockPosition): void {
    const stage = this.getCropStage(crop);
    const visuals = this.getStageVisuals(stage);
    
    // Apply visual properties to the crop
    this.applyVisuals(crop, position, visuals);
  }

  /**
   * Update the visual representation of a crop
   */
  updateCropVisuals(crop: T): void {
    const stage = this.getCropStage(crop);
    const visuals = this.getStageVisuals(stage);
    
    // Update the crop's visual properties
    this.updateVisualProperties(crop, visuals);
  }

  /**
   * Get the current growth stage of a crop
   * Must be implemented by subclasses
   */
  protected abstract getCropStage(crop: T): number;

  /**
   * Apply visual properties to a crop at a specific position
   * Can be overridden by subclasses for custom rendering logic
   */
  protected applyVisuals(crop: T, position: BlockPosition, visuals: StageVisuals): void {
    // Default implementation - subclasses can override
    // In a real game engine, this would interact with the rendering system
    this.updateVisualProperties(crop, visuals);
  }

  /**
   * Update the visual properties of a crop
   * Can be overridden by subclasses for custom update logic
   */
  protected updateVisualProperties(crop: T, visuals: StageVisuals): void {
    // Default implementation - subclasses can override
    // In a real game engine, this would update the visual representation
  }
}
