/**
 * Generic interface for all crop types in the farming system.
 * This interface defines the core properties and behaviors that all crops must implement.
 * 
 * @template T The specific crop type (e.g., OatCrop, WheatCrop, CornCrop)
 */
export interface ICrop {
  /** Unique identifier for this crop instance */
  id: string;
  
  /** Position of the crop in the world */
  position: BlockPosition;
  
  /** Current growth stage (1-based indexing) */
  stage: number;
  
  /** Time elapsed in the current stage (in seconds) */
  stageProgress: number;
  
  /** Total age of the crop since planting (in seconds) */
  totalAge: number;
  
  /** Timestamp when the crop was planted */
  plantedAt: number;
  
  /** Timestamp of the last update */
  lastUpdateTime: number;
  
  /** Current visual height for rendering (in blocks) */
  visualHeight: number;
  
  /** Timer for particle effects */
  particleTimer: number;
}

/**
 * Position of a block in the world with chunk coordinates.
 */
export interface BlockPosition {
  x: number;
  y: number;
  z: number;
  world: string;
  chunk: ChunkCoordinates;
}

/**
 * Chunk coordinates in the world.
 */
export interface ChunkCoordinates {
  chunkX: number;
  chunkZ: number;
}
