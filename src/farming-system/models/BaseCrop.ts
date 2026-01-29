import { ICrop, BlockPosition } from '../interfaces';
import { CropConfig } from '../config';

/**
 * Abstract base class for all crop types.
 * Provides common functionality and enforces the ICrop interface.
 * Specific crop types (OatCrop, WheatCrop, etc.) should extend this class.
 */
export abstract class BaseCrop implements ICrop {
  id: string;
  position: BlockPosition;
  stage: number;
  stageProgress: number;
  totalAge: number;
  plantedAt: number;
  lastUpdateTime: number;
  visualHeight: number;
  particleTimer: number;
  
  /**
   * Configuration for this crop type.
   */
  protected config: CropConfig;
  
  /**
   * Create a new crop instance.
   * @param id Unique identifier for this crop
   * @param position Position in the world
   * @param config Configuration for this crop type
   */
  constructor(id: string, position: BlockPosition, config: CropConfig) {
    this.config = config;
    this.id = id;
    this.position = position;
    this.stage = 1; // Always start at stage 1 (Germination)
    this.stageProgress = 0;
    this.totalAge = 0;
    this.plantedAt = Date.now();
    this.lastUpdateTime = Date.now();
    this.visualHeight = this.getInitialHeight();
    this.particleTimer = 0;
  }
  
  /**
   * Get the initial visual height for stage 1.
   * @returns The height in blocks
   */
  protected getInitialHeight(): number {
    const stageVisual = this.config.stageVisuals.find(v => v.stage === 1);
    return stageVisual?.height ?? 0.15;
  }
  
  /**
   * Get the time required for the current stage.
   * @returns Time in seconds
   */
  getStageTime(): number {
    const stageIndex = this.stage - 1; // Convert to 0-based index
    if (stageIndex < 0 || stageIndex >= this.config.stageDistribution.length) {
      return 0;
    }
    return this.config.baseGrowthTime * this.config.stageDistribution[stageIndex];
  }
  
  /**
   * Check if the crop is at maximum maturity.
   * @returns True if at final stage
   */
  isMature(): boolean {
    return this.stage >= this.config.stageCount;
  }
  
  /**
   * Get the visual properties for the current stage.
   * @returns The stage visual configuration
   */
  getVisualProperties() {
    return this.config.stageVisuals.find(v => v.stage === this.stage);
  }
  
  /**
   * Serialize the crop to a plain object for saving.
   * @returns Serialized crop data
   */
  toJSON(): CropSaveData {
    return {
      id: this.id,
      position: this.position,
      stage: this.stage,
      stageProgress: this.stageProgress,
      totalAge: this.totalAge,
      plantedAt: this.plantedAt,
      lastUpdateTime: this.lastUpdateTime
    };
  }
  
  /**
   * Restore crop state from saved data.
   * @param data Saved crop data
   */
  fromJSON(data: CropSaveData): void {
    this.id = data.id;
    this.position = data.position;
    this.stage = data.stage;
    this.stageProgress = data.stageProgress;
    this.totalAge = data.totalAge;
    this.plantedAt = data.plantedAt;
    this.lastUpdateTime = data.lastUpdateTime;
    
    // Recalculate visual properties
    const visual = this.getVisualProperties();
    if (visual) {
      this.visualHeight = visual.height;
      if (visual.heightVariation) {
        this.visualHeight += Math.random() * visual.heightVariation;
      }
    }
  }
}

/**
 * Data structure for saving/loading crops.
 */
export interface CropSaveData {
  id: string;
  position: BlockPosition;
  stage: number;
  stageProgress: number;
  totalAge: number;
  plantedAt: number;
  lastUpdateTime: number;
}
