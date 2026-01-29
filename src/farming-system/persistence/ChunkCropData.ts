import { ChunkCoordinates } from '../interfaces';
import { CropSaveData } from '../models/BaseCrop';

/**
 * Generic data structure for storing crops in a chunk.
 * This structure can store any type of crop that implements CropSaveData.
 * 
 * @template T The type of crop save data (extends CropSaveData)
 */
export interface ChunkCropData<T extends CropSaveData> {
  /** Coordinates of the chunk */
  chunkCoords: ChunkCoordinates;
  
  /** Array of crops in this chunk */
  crops: T[];
  
  /** Version of the save format (for future compatibility) */
  version: number;
  
  /** Timestamp when this chunk data was last saved */
  lastSaved?: number;
}

/**
 * Specialized chunk data for oat crops.
 * This is a concrete implementation of ChunkCropData for oats.
 */
export interface ChunkOatData extends ChunkCropData<CropSaveData> {
  /** Type identifier for deserialization */
  cropType: 'oat';
}

/**
 * Current version of the chunk save format.
 * Increment this when making breaking changes to the save format.
 */
export const CHUNK_DATA_VERSION = 1;

/**
 * Create an empty chunk data structure.
 * @param chunkCoords The chunk coordinates
 * @param cropType The type of crop (for specialized implementations)
 * @returns Empty chunk data structure
 */
export function createEmptyChunkData(
  chunkCoords: ChunkCoordinates,
  cropType: 'oat' = 'oat'
): ChunkOatData {
  return {
    chunkCoords,
    crops: [],
    version: CHUNK_DATA_VERSION,
    cropType,
    lastSaved: Date.now()
  };
}

/**
 * Validate chunk data structure.
 * @param data The chunk data to validate
 * @returns True if valid, false otherwise
 */
export function isValidChunkData(data: any): data is ChunkCropData<CropSaveData> {
  if (!data || typeof data !== 'object') {
    return false;
  }
  
  // Check required fields
  if (!data.chunkCoords || typeof data.chunkCoords !== 'object') {
    return false;
  }
  
  if (typeof data.chunkCoords.chunkX !== 'number' || 
      typeof data.chunkCoords.chunkZ !== 'number') {
    return false;
  }
  
  if (!Array.isArray(data.crops)) {
    return false;
  }
  
  if (typeof data.version !== 'number') {
    return false;
  }
  
  return true;
}

/**
 * Check if chunk data is compatible with current version.
 * @param data The chunk data to check
 * @returns True if compatible, false if migration needed
 */
export function isCompatibleVersion(data: ChunkCropData<CropSaveData>): boolean {
  return data.version === CHUNK_DATA_VERSION;
}
