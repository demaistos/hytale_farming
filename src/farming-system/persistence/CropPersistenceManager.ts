import { ChunkCoordinates } from '../interfaces';
import { CropSaveData } from '../models/BaseCrop';
import { ChunkCropData, isValidChunkData, isCompatibleVersion, CHUNK_DATA_VERSION } from './ChunkCropData';

/**
 * Error types for persistence operations.
 */
export enum PersistenceErrorType {
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  INCOMPATIBLE_VERSION = 'INCOMPATIBLE_VERSION',
  INVALID_FORMAT = 'INVALID_FORMAT',
  STORAGE_ERROR = 'STORAGE_ERROR'
}

/**
 * Error information for persistence operations.
 */
export interface PersistenceError {
  type: PersistenceErrorType;
  message: string;
  chunkCoords?: ChunkCoordinates;
  originalError?: Error;
}

/**
 * Result of a persistence operation.
 */
export interface PersistenceResult<T> {
  success: boolean;
  data?: T;
  error?: PersistenceError;
}

/**
 * Storage backend interface for persistence.
 * Implementations can use file system, database, or any other storage mechanism.
 */
export interface IStorageBackend {
  /**
   * Save data to storage.
   * @param key Storage key (e.g., chunk coordinates as string)
   * @param data Data to save
   */
  save(key: string, data: string): Promise<void>;
  
  /**
   * Load data from storage.
   * @param key Storage key
   * @returns Loaded data or null if not found
   */
  load(key: string): Promise<string | null>;
  
  /**
   * Delete data from storage.
   * @param key Storage key
   */
  delete(key: string): Promise<void>;
  
  /**
   * Check if data exists in storage.
   * @param key Storage key
   */
  exists(key: string): Promise<boolean>;
}

/**
 * Generic persistence manager for crop data.
 * Handles saving and loading of crop data to/from storage.
 * 
 * @template T The type of crop save data (extends CropSaveData)
 */
export class CropPersistenceManager<T extends CropSaveData> {
  private storage: IStorageBackend;
  private cropType: string;
  
  /**
   * Create a new persistence manager.
   * @param storage Storage backend to use
   * @param cropType Type identifier for this crop (e.g., 'oat', 'wheat')
   */
  constructor(storage: IStorageBackend, cropType: string) {
    this.storage = storage;
    this.cropType = cropType;
  }
  
  /**
   * Generate a storage key for a chunk.
   * @param chunkCoords Chunk coordinates
   * @returns Storage key string
   */
  private getChunkKey(chunkCoords: ChunkCoordinates): string {
    return `chunk_${this.cropType}_${chunkCoords.chunkX}_${chunkCoords.chunkZ}`;
  }
  
  /**
   * Save chunk crop data to storage.
   * @param chunkData Chunk data to save
   * @returns Result of the save operation
   */
  async saveChunk(chunkData: ChunkCropData<T>): Promise<PersistenceResult<void>> {
    try {
      // Update last saved timestamp
      const dataToSave = {
        ...chunkData,
        lastSaved: Date.now()
      };
      
      // Serialize to JSON
      const json = JSON.stringify(dataToSave);
      
      // Save to storage
      const key = this.getChunkKey(chunkData.chunkCoords);
      await this.storage.save(key, json);
      
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          type: PersistenceErrorType.STORAGE_ERROR,
          message: `Failed to save chunk data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          chunkCoords: chunkData.chunkCoords,
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }
  
  /**
   * Load chunk crop data from storage.
   * @param chunkCoords Chunk coordinates
   * @returns Result of the load operation with chunk data
   */
  async loadChunk(chunkCoords: ChunkCoordinates): Promise<PersistenceResult<ChunkCropData<T>>> {
    try {
      // Load from storage
      const key = this.getChunkKey(chunkCoords);
      const json = await this.storage.load(key);
      
      // If no data exists, return empty chunk
      if (json === null) {
        return {
          success: true,
          data: {
            chunkCoords,
            crops: [],
            version: CHUNK_DATA_VERSION
          }
        };
      }
      
      // Parse JSON
      let data: any;
      try {
        data = JSON.parse(json);
      } catch (parseError) {
        return {
          success: false,
          error: {
            type: PersistenceErrorType.CORRUPTED_DATA,
            message: 'Failed to parse chunk data JSON',
            chunkCoords,
            originalError: parseError instanceof Error ? parseError : undefined
          }
        };
      }
      
      // Validate data structure
      if (!isValidChunkData(data)) {
        return {
          success: false,
          error: {
            type: PersistenceErrorType.INVALID_FORMAT,
            message: 'Chunk data has invalid format',
            chunkCoords
          }
        };
      }
      
      // Check version compatibility
      if (!isCompatibleVersion(data)) {
        return {
          success: false,
          error: {
            type: PersistenceErrorType.INCOMPATIBLE_VERSION,
            message: `Incompatible chunk data version: ${data.version} (current: ${CHUNK_DATA_VERSION})`,
            chunkCoords
          }
        };
      }
      
      return {
        success: true,
        data: data as ChunkCropData<T>
      };
    } catch (error) {
      return {
        success: false,
        error: {
          type: PersistenceErrorType.STORAGE_ERROR,
          message: `Failed to load chunk data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          chunkCoords,
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }
  
  /**
   * Delete chunk crop data from storage.
   * @param chunkCoords Chunk coordinates
   * @returns Result of the delete operation
   */
  async deleteChunk(chunkCoords: ChunkCoordinates): Promise<PersistenceResult<void>> {
    try {
      const key = this.getChunkKey(chunkCoords);
      await this.storage.delete(key);
      return { success: true };
    } catch (error) {
      return {
        success: false,
        error: {
          type: PersistenceErrorType.STORAGE_ERROR,
          message: `Failed to delete chunk data: ${error instanceof Error ? error.message : 'Unknown error'}`,
          chunkCoords,
          originalError: error instanceof Error ? error : undefined
        }
      };
    }
  }
  
  /**
   * Check if chunk data exists in storage.
   * @param chunkCoords Chunk coordinates
   * @returns True if chunk data exists
   */
  async hasChunk(chunkCoords: ChunkCoordinates): Promise<boolean> {
    try {
      const key = this.getChunkKey(chunkCoords);
      return await this.storage.exists(key);
    } catch (error) {
      // If we can't check existence, assume it doesn't exist
      return false;
    }
  }
  
  /**
   * Save multiple crops to a chunk.
   * This is a convenience method for saving all crops in a chunk at once.
   * 
   * @param chunkCoords Chunk coordinates
   * @param crops Array of crop save data
   * @returns Result of the save operation
   */
  async saveCrops(chunkCoords: ChunkCoordinates, crops: T[]): Promise<PersistenceResult<void>> {
    const chunkData: ChunkCropData<T> = {
      chunkCoords,
      crops,
      version: CHUNK_DATA_VERSION
    };
    
    return this.saveChunk(chunkData);
  }
  
  /**
   * Load all crops from a chunk.
   * This is a convenience method for loading all crops in a chunk at once.
   * 
   * @param chunkCoords Chunk coordinates
   * @returns Result of the load operation with array of crops
   */
  async loadCrops(chunkCoords: ChunkCoordinates): Promise<PersistenceResult<T[]>> {
    const result = await this.loadChunk(chunkCoords);
    
    if (!result.success || !result.data) {
      return {
        success: false,
        error: result.error
      };
    }
    
    return {
      success: true,
      data: result.data.crops
    };
  }
}
