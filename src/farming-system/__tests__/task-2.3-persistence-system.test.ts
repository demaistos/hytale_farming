/**
 * Task 2.3: Test generic chunk save/load system
 * 
 * This test suite verifies:
 * - ChunkCropData<T> generic structure
 * - CropPersistenceManager generic save/restore functionality
 * - OatPersistenceManager specialization
 * - Save methods during chunk unload
 * - Restore methods during chunk load
 * - Error handling for corrupted data
 */

import { OatCrop } from '../models/OatCrop';
import { BlockPosition, ChunkCoordinates } from '../interfaces';
import { 
  ChunkCropData, 
  ChunkOatData, 
  createEmptyChunkData,
  isValidChunkData,
  isCompatibleVersion,
  CHUNK_DATA_VERSION
} from '../persistence/ChunkCropData';
import { 
  CropPersistenceManager,
  PersistenceErrorType,
  IStorageBackend
} from '../persistence/CropPersistenceManager';
import { OatPersistenceManager } from '../persistence/OatPersistenceManager';
import { InMemoryStorage } from '../persistence/InMemoryStorage';
import { CropSaveData } from '../models/BaseCrop';

describe('Task 2.3: Generic Chunk Save/Load System', () => {
  
  describe('ChunkCropData<T> Generic Structure', () => {
    it('should create a generic chunk data structure', () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 5, chunkZ: 10 };
      const chunkData: ChunkCropData<CropSaveData> = {
        chunkCoords,
        crops: [],
        version: CHUNK_DATA_VERSION
      };
      
      expect(chunkData.chunkCoords).toEqual(chunkCoords);
      expect(chunkData.crops).toEqual([]);
      expect(chunkData.version).toBe(CHUNK_DATA_VERSION);
    });
    
    it('should store multiple crops in a chunk', () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 0, chunkZ: 0 };
      
      const position1: BlockPosition = {
        x: 10, y: 64, z: 20,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      const position2: BlockPosition = {
        x: 15, y: 64, z: 25,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      const crop1 = new OatCrop('crop-1', position1);
      const crop2 = new OatCrop('crop-2', position2);
      
      const chunkData: ChunkCropData<CropSaveData> = {
        chunkCoords,
        crops: [crop1.toJSON(), crop2.toJSON()],
        version: CHUNK_DATA_VERSION
      };
      
      expect(chunkData.crops).toHaveLength(2);
      expect(chunkData.crops[0].id).toBe('crop-1');
      expect(chunkData.crops[1].id).toBe('crop-2');
    });
    
    it('should create empty chunk data with helper function', () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 3, chunkZ: -5 };
      const emptyChunk = createEmptyChunkData(chunkCoords);
      
      expect(emptyChunk.chunkCoords).toEqual(chunkCoords);
      expect(emptyChunk.crops).toEqual([]);
      expect(emptyChunk.version).toBe(CHUNK_DATA_VERSION);
      expect(emptyChunk.cropType).toBe('oat');
      expect(emptyChunk.lastSaved).toBeDefined();
    });
    
    it('should validate chunk data structure', () => {
      const validData: ChunkCropData<CropSaveData> = {
        chunkCoords: { chunkX: 0, chunkZ: 0 },
        crops: [],
        version: CHUNK_DATA_VERSION
      };
      
      expect(isValidChunkData(validData)).toBe(true);
    });
    
    it('should reject invalid chunk data structures', () => {
      // Missing chunkCoords
      expect(isValidChunkData({ crops: [], version: 1 })).toBe(false);
      
      // Invalid chunkCoords
      expect(isValidChunkData({ 
        chunkCoords: { chunkX: 'invalid' }, 
        crops: [], 
        version: 1 
      })).toBe(false);
      
      // Missing crops array
      expect(isValidChunkData({ 
        chunkCoords: { chunkX: 0, chunkZ: 0 }, 
        version: 1 
      })).toBe(false);
      
      // Invalid crops (not an array)
      expect(isValidChunkData({ 
        chunkCoords: { chunkX: 0, chunkZ: 0 }, 
        crops: 'invalid', 
        version: 1 
      })).toBe(false);
      
      // Missing version
      expect(isValidChunkData({ 
        chunkCoords: { chunkX: 0, chunkZ: 0 }, 
        crops: [] 
      })).toBe(false);
    });
    
    it('should check version compatibility', () => {
      const compatibleData: ChunkCropData<CropSaveData> = {
        chunkCoords: { chunkX: 0, chunkZ: 0 },
        crops: [],
        version: CHUNK_DATA_VERSION
      };
      
      expect(isCompatibleVersion(compatibleData)).toBe(true);
      
      const incompatibleData: ChunkCropData<CropSaveData> = {
        chunkCoords: { chunkX: 0, chunkZ: 0 },
        crops: [],
        version: CHUNK_DATA_VERSION + 1
      };
      
      expect(isCompatibleVersion(incompatibleData)).toBe(false);
    });
  });
  
  describe('CropPersistenceManager Generic Save/Restore', () => {
    let storage: InMemoryStorage;
    let manager: CropPersistenceManager<CropSaveData>;
    
    beforeEach(() => {
      storage = new InMemoryStorage();
      manager = new CropPersistenceManager(storage, 'oat');
    });
    
    afterEach(() => {
      storage.clear();
    });
    
    it('should save chunk data to storage', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 1, chunkZ: 2 };
      const position: BlockPosition = {
        x: 16, y: 64, z: 32,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      const crop = new OatCrop('save-test', position);
      const chunkData: ChunkCropData<CropSaveData> = {
        chunkCoords,
        crops: [crop.toJSON()],
        version: CHUNK_DATA_VERSION
      };
      
      const result = await manager.saveChunk(chunkData);
      
      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();
      expect(storage.size()).toBe(1);
    });
    
    it('should load chunk data from storage', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 3, chunkZ: 4 };
      const position: BlockPosition = {
        x: 48, y: 64, z: 64,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      const crop = new OatCrop('load-test', position);
      crop.stage = 2;
      crop.stageProgress = 50000;
      
      const chunkData: ChunkCropData<CropSaveData> = {
        chunkCoords,
        crops: [crop.toJSON()],
        version: CHUNK_DATA_VERSION
      };
      
      // Save first
      await manager.saveChunk(chunkData);
      
      // Then load
      const result = await manager.loadChunk(chunkCoords);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.chunkCoords).toEqual(chunkCoords);
      expect(result.data?.crops).toHaveLength(1);
      expect(result.data?.crops[0].id).toBe('load-test');
      expect(result.data?.crops[0].stage).toBe(2);
      expect(result.data?.crops[0].stageProgress).toBe(50000);
    });
    
    it('should return empty chunk when no data exists', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 99, chunkZ: 99 };
      
      const result = await manager.loadChunk(chunkCoords);
      
      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.crops).toEqual([]);
      expect(result.data?.chunkCoords).toEqual(chunkCoords);
    });
    
    it('should save and load multiple crops in a chunk', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 5, chunkZ: 6 };
      
      const crops: OatCrop[] = [];
      for (let i = 0; i < 10; i++) {
        const position: BlockPosition = {
          x: 80 + i, y: 64, z: 96,
          world: 'overworld',
          chunk: chunkCoords
        };
        const crop = new OatCrop(`multi-crop-${i}`, position);
        crop.stage = (i % 4) + 1;
        crops.push(crop);
      }
      
      const chunkData: ChunkCropData<CropSaveData> = {
        chunkCoords,
        crops: crops.map(c => c.toJSON()),
        version: CHUNK_DATA_VERSION
      };
      
      // Save
      const saveResult = await manager.saveChunk(chunkData);
      expect(saveResult.success).toBe(true);
      
      // Load
      const loadResult = await manager.loadChunk(chunkCoords);
      expect(loadResult.success).toBe(true);
      expect(loadResult.data?.crops).toHaveLength(10);
      
      // Verify each crop
      for (let i = 0; i < 10; i++) {
        expect(loadResult.data?.crops[i].id).toBe(`multi-crop-${i}`);
        expect(loadResult.data?.crops[i].stage).toBe((i % 4) + 1);
      }
    });
    
    it('should delete chunk data from storage', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 7, chunkZ: 8 };
      const chunkData: ChunkCropData<CropSaveData> = {
        chunkCoords,
        crops: [],
        version: CHUNK_DATA_VERSION
      };
      
      // Save
      await manager.saveChunk(chunkData);
      expect(await manager.hasChunk(chunkCoords)).toBe(true);
      
      // Delete
      const result = await manager.deleteChunk(chunkCoords);
      expect(result.success).toBe(true);
      expect(await manager.hasChunk(chunkCoords)).toBe(false);
    });
    
    it('should check if chunk exists in storage', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 9, chunkZ: 10 };
      
      // Should not exist initially
      expect(await manager.hasChunk(chunkCoords)).toBe(false);
      
      // Save chunk
      const chunkData: ChunkCropData<CropSaveData> = {
        chunkCoords,
        crops: [],
        version: CHUNK_DATA_VERSION
      };
      await manager.saveChunk(chunkData);
      
      // Should exist now
      expect(await manager.hasChunk(chunkCoords)).toBe(true);
    });
    
    it('should use convenience method to save crops', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 11, chunkZ: 12 };
      const position: BlockPosition = {
        x: 176, y: 64, z: 192,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      const crop = new OatCrop('convenience-save', position);
      const crops = [crop.toJSON()];
      
      const result = await manager.saveCrops(chunkCoords, crops);
      
      expect(result.success).toBe(true);
      expect(await manager.hasChunk(chunkCoords)).toBe(true);
    });
    
    it('should use convenience method to load crops', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 13, chunkZ: 14 };
      const position: BlockPosition = {
        x: 208, y: 64, z: 224,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      const crop = new OatCrop('convenience-load', position);
      await manager.saveCrops(chunkCoords, [crop.toJSON()]);
      
      const result = await manager.loadCrops(chunkCoords);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(1);
      expect(result.data?.[0].id).toBe('convenience-load');
    });
  });
  
  describe('OatPersistenceManager Specialization', () => {
    let storage: InMemoryStorage;
    let manager: OatPersistenceManager;
    
    beforeEach(() => {
      storage = new InMemoryStorage();
      manager = new OatPersistenceManager(storage);
    });
    
    afterEach(() => {
      storage.clear();
    });
    
    it('should save oat-specific chunk data', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 15, chunkZ: 16 };
      const oatChunk: ChunkOatData = {
        chunkCoords,
        crops: [],
        version: CHUNK_DATA_VERSION,
        cropType: 'oat'
      };
      
      const result = await manager.saveOatChunk(oatChunk);
      
      expect(result.success).toBe(true);
    });
    
    it('should load oat-specific chunk data', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 17, chunkZ: 18 };
      const position: BlockPosition = {
        x: 272, y: 64, z: 288,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      const crop = new OatCrop('oat-specific', position);
      const oatChunk: ChunkOatData = {
        chunkCoords,
        crops: [crop.toJSON()],
        version: CHUNK_DATA_VERSION,
        cropType: 'oat'
      };
      
      await manager.saveOatChunk(oatChunk);
      
      const result = await manager.loadOatChunk(chunkCoords);
      
      expect(result.success).toBe(true);
      expect(result.data?.cropType).toBe('oat');
      expect(result.data?.crops).toHaveLength(1);
    });
    
    it('should create empty oat chunk', () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 19, chunkZ: 20 };
      const emptyChunk = manager.createEmptyOatChunk(chunkCoords);
      
      expect(emptyChunk.cropType).toBe('oat');
      expect(emptyChunk.crops).toEqual([]);
      expect(emptyChunk.chunkCoords).toEqual(chunkCoords);
    });
  });
  
  describe('Error Handling for Corrupted Data', () => {
    let storage: InMemoryStorage;
    let manager: CropPersistenceManager<CropSaveData>;
    
    beforeEach(() => {
      storage = new InMemoryStorage();
      manager = new CropPersistenceManager(storage, 'oat');
    });
    
    afterEach(() => {
      storage.clear();
    });
    
    it('should handle corrupted JSON data', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 21, chunkZ: 22 };
      const key = `chunk_oat_${chunkCoords.chunkX}_${chunkCoords.chunkZ}`;
      
      // Save corrupted JSON
      await storage.save(key, 'invalid json {{{');
      
      const result = await manager.loadChunk(chunkCoords);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(PersistenceErrorType.CORRUPTED_DATA);
      expect(result.error?.message).toContain('parse');
    });
    
    it('should handle invalid data format', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 23, chunkZ: 24 };
      const key = `chunk_oat_${chunkCoords.chunkX}_${chunkCoords.chunkZ}`;
      
      // Save data with invalid format
      const invalidData = {
        // Missing required fields
        someField: 'value'
      };
      await storage.save(key, JSON.stringify(invalidData));
      
      const result = await manager.loadChunk(chunkCoords);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(PersistenceErrorType.INVALID_FORMAT);
    });
    
    it('should handle incompatible version', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 25, chunkZ: 26 };
      const key = `chunk_oat_${chunkCoords.chunkX}_${chunkCoords.chunkZ}`;
      
      // Save data with incompatible version
      const incompatibleData = {
        chunkCoords,
        crops: [],
        version: CHUNK_DATA_VERSION + 999
      };
      await storage.save(key, JSON.stringify(incompatibleData));
      
      const result = await manager.loadChunk(chunkCoords);
      
      expect(result.success).toBe(false);
      expect(result.error?.type).toBe(PersistenceErrorType.INCOMPATIBLE_VERSION);
      expect(result.error?.message).toContain('version');
    });
    
    it('should include chunk coordinates in error information', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 27, chunkZ: 28 };
      const key = `chunk_oat_${chunkCoords.chunkX}_${chunkCoords.chunkZ}`;
      
      await storage.save(key, 'corrupted');
      
      const result = await manager.loadChunk(chunkCoords);
      
      expect(result.success).toBe(false);
      expect(result.error?.chunkCoords).toEqual(chunkCoords);
    });
    
    it('should continue operation after error', async () => {
      const corruptedCoords: ChunkCoordinates = { chunkX: 29, chunkZ: 30 };
      const validCoords: ChunkCoordinates = { chunkX: 31, chunkZ: 32 };
      
      // Save corrupted data
      const corruptedKey = `chunk_oat_${corruptedCoords.chunkX}_${corruptedCoords.chunkZ}`;
      await storage.save(corruptedKey, 'corrupted');
      
      // Save valid data
      const validChunk: ChunkCropData<CropSaveData> = {
        chunkCoords: validCoords,
        crops: [],
        version: CHUNK_DATA_VERSION
      };
      await manager.saveChunk(validChunk);
      
      // Load corrupted chunk (should fail)
      const corruptedResult = await manager.loadChunk(corruptedCoords);
      expect(corruptedResult.success).toBe(false);
      
      // Load valid chunk (should succeed)
      const validResult = await manager.loadChunk(validCoords);
      expect(validResult.success).toBe(true);
    });
  });
  
  describe('Chunk Unload/Load Simulation', () => {
    let storage: InMemoryStorage;
    let manager: OatPersistenceManager;
    
    beforeEach(() => {
      storage = new InMemoryStorage();
      manager = new OatPersistenceManager(storage);
    });
    
    afterEach(() => {
      storage.clear();
    });
    
    it('should simulate chunk unload by saving all crops', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 33, chunkZ: 34 };
      
      // Create crops in the chunk
      const crops: OatCrop[] = [];
      for (let i = 0; i < 5; i++) {
        const position: BlockPosition = {
          x: 528 + i, y: 64, z: 544,
          world: 'overworld',
          chunk: chunkCoords
        };
        const crop = new OatCrop(`unload-crop-${i}`, position);
        crop.stage = (i % 4) + 1;
        crop.stageProgress = i * 10000;
        crops.push(crop);
      }
      
      // Simulate chunk unload: save all crops
      const cropData = crops.map(c => c.toJSON());
      const result = await manager.saveCrops(chunkCoords, cropData);
      
      expect(result.success).toBe(true);
      expect(await manager.hasChunk(chunkCoords)).toBe(true);
    });
    
    it('should simulate chunk load by restoring all crops', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 35, chunkZ: 36 };
      
      // Save crops (simulating previous unload)
      const crops: CropSaveData[] = [];
      for (let i = 0; i < 5; i++) {
        const position: BlockPosition = {
          x: 560 + i, y: 64, z: 576,
          world: 'overworld',
          chunk: chunkCoords
        };
        const crop = new OatCrop(`load-crop-${i}`, position);
        crop.stage = (i % 4) + 1;
        crop.stageProgress = i * 10000;
        crops.push(crop.toJSON());
      }
      await manager.saveCrops(chunkCoords, crops);
      
      // Simulate chunk load: restore all crops
      const result = await manager.loadCrops(chunkCoords);
      
      expect(result.success).toBe(true);
      expect(result.data).toHaveLength(5);
      
      // Verify crops can be restored
      const restoredCrops = result.data!.map(data => OatCrop.fromSaveData(data));
      expect(restoredCrops).toHaveLength(5);
      
      for (let i = 0; i < 5; i++) {
        expect(restoredCrops[i].id).toBe(`load-crop-${i}`);
        expect(restoredCrops[i].stage).toBe((i % 4) + 1);
        expect(restoredCrops[i].stageProgress).toBe(i * 10000);
      }
    });
    
    it('should maintain crop state through unload/load cycle', async () => {
      const chunkCoords: ChunkCoordinates = { chunkX: 37, chunkZ: 38 };
      const position: BlockPosition = {
        x: 592, y: 64, z: 608,
        world: 'overworld',
        chunk: chunkCoords
      };
      
      // Create crop with specific state
      const originalCrop = new OatCrop('cycle-test', position);
      originalCrop.stage = 3;
      originalCrop.stageProgress = 75000;
      originalCrop.totalAge = 250000;
      
      // Unload: save crop
      await manager.saveCrops(chunkCoords, [originalCrop.toJSON()]);
      
      // Load: restore crop
      const loadResult = await manager.loadCrops(chunkCoords);
      expect(loadResult.success).toBe(true);
      
      const restoredCrop = OatCrop.fromSaveData(loadResult.data![0]);
      
      // Verify state is maintained
      expect(restoredCrop.id).toBe(originalCrop.id);
      expect(restoredCrop.stage).toBe(originalCrop.stage);
      expect(restoredCrop.stageProgress).toBe(originalCrop.stageProgress);
      expect(restoredCrop.totalAge).toBe(originalCrop.totalAge);
      expect(restoredCrop.position).toEqual(originalCrop.position);
    });
  });
  
  describe('InMemoryStorage Backend', () => {
    it('should store and retrieve data', async () => {
      const storage = new InMemoryStorage();
      
      await storage.save('test-key', 'test-data');
      const data = await storage.load('test-key');
      
      expect(data).toBe('test-data');
    });
    
    it('should return null for non-existent keys', async () => {
      const storage = new InMemoryStorage();
      
      const data = await storage.load('non-existent');
      
      expect(data).toBeNull();
    });
    
    it('should delete data', async () => {
      const storage = new InMemoryStorage();
      
      await storage.save('delete-test', 'data');
      expect(await storage.exists('delete-test')).toBe(true);
      
      await storage.delete('delete-test');
      expect(await storage.exists('delete-test')).toBe(false);
    });
    
    it('should check existence', async () => {
      const storage = new InMemoryStorage();
      
      expect(await storage.exists('test')).toBe(false);
      
      await storage.save('test', 'data');
      expect(await storage.exists('test')).toBe(true);
    });
    
    it('should clear all data', async () => {
      const storage = new InMemoryStorage();
      
      await storage.save('key1', 'data1');
      await storage.save('key2', 'data2');
      expect(storage.size()).toBe(2);
      
      storage.clear();
      expect(storage.size()).toBe(0);
    });
    
    it('should return all keys', async () => {
      const storage = new InMemoryStorage();
      
      await storage.save('key1', 'data1');
      await storage.save('key2', 'data2');
      
      const keys = storage.keys();
      expect(keys).toContain('key1');
      expect(keys).toContain('key2');
      expect(keys).toHaveLength(2);
    });
  });
});
