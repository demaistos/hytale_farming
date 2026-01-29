import { CropPersistenceManager } from './CropPersistenceManager';
import { CropSaveData } from '../models/BaseCrop';
import { ChunkOatData, createEmptyChunkData } from './ChunkCropData';
import { ChunkCoordinates } from '../interfaces';
import { IStorageBackend, PersistenceResult } from './CropPersistenceManager';

/**
 * Specialized persistence manager for oat crops.
 * Extends the generic CropPersistenceManager with oat-specific functionality.
 */
export class OatPersistenceManager extends CropPersistenceManager<CropSaveData> {
  /**
   * Create a new oat persistence manager.
   * @param storage Storage backend to use
   */
  constructor(storage: IStorageBackend) {
    super(storage, 'oat');
  }
  
  /**
   * Save oat chunk data with type information.
   * @param chunkData Oat chunk data to save
   * @returns Result of the save operation
   */
  async saveOatChunk(chunkData: ChunkOatData): Promise<PersistenceResult<void>> {
    return this.saveChunk(chunkData);
  }
  
  /**
   * Load oat chunk data with type information.
   * @param chunkCoords Chunk coordinates
   * @returns Result of the load operation with oat chunk data
   */
  async loadOatChunk(chunkCoords: ChunkCoordinates): Promise<PersistenceResult<ChunkOatData>> {
    const result = await this.loadChunk(chunkCoords);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error
      };
    }
    
    // Add oat-specific type information
    const oatData: ChunkOatData = {
      ...result.data,
      cropType: 'oat'
    };
    
    return {
      success: true,
      data: oatData
    };
  }
  
  /**
   * Create an empty oat chunk data structure.
   * @param chunkCoords Chunk coordinates
   * @returns Empty oat chunk data
   */
  createEmptyOatChunk(chunkCoords: ChunkCoordinates): ChunkOatData {
    return createEmptyChunkData(chunkCoords, 'oat');
  }
}
