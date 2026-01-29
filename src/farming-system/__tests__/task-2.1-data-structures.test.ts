/**
 * Task 2.1: Test data structures and serialization/deserialization
 * 
 * This test suite verifies:
 * - ICrop interface implementation
 * - BaseCrop abstract class functionality
 * - OatCrop specific implementation
 * - BlockPosition with chunk coordinates
 * - Generic serialization/deserialization methods
 */

import { OatCrop } from '../models/OatCrop';
import { BaseCrop, CropSaveData } from '../models/BaseCrop';
import { ICrop, BlockPosition, ChunkCoordinates } from '../interfaces/ICrop';
import { oatConfig } from '../config/OatSystemConfig';

describe('Task 2.1: Data Structures and Serialization', () => {
  
  describe('ICrop Interface Implementation', () => {
    it('should implement all required ICrop properties', () => {
      const position: BlockPosition = {
        x: 100,
        y: 64,
        z: 200,
        world: 'overworld',
        chunk: { chunkX: 6, chunkZ: 12 }
      };
      
      const crop = new OatCrop('test-crop-1', position);
      
      // Verify all ICrop properties exist
      expect(crop).toHaveProperty('id');
      expect(crop).toHaveProperty('position');
      expect(crop).toHaveProperty('stage');
      expect(crop).toHaveProperty('stageProgress');
      expect(crop).toHaveProperty('totalAge');
      expect(crop).toHaveProperty('plantedAt');
      expect(crop).toHaveProperty('lastUpdateTime');
      expect(crop).toHaveProperty('visualHeight');
      expect(crop).toHaveProperty('particleTimer');
    });
    
    it('should have correct initial values', () => {
      const position: BlockPosition = {
        x: 100,
        y: 64,
        z: 200,
        world: 'overworld',
        chunk: { chunkX: 6, chunkZ: 12 }
      };
      
      const crop = new OatCrop('test-crop-2', position);
      
      expect(crop.id).toBe('test-crop-2');
      expect(crop.position).toEqual(position);
      expect(crop.stage).toBe(1); // Always starts at stage 1 (Germination)
      expect(crop.stageProgress).toBe(0);
      expect(crop.totalAge).toBe(0);
      expect(crop.visualHeight).toBe(0.15); // Stage 1 height for oats
      expect(crop.particleTimer).toBe(0);
    });
  });
  
  describe('BlockPosition with Chunk Coordinates', () => {
    it('should correctly store world position and chunk coordinates', () => {
      const chunkCoords: ChunkCoordinates = {
        chunkX: 10,
        chunkZ: -5
      };
      
      const position: BlockPosition = {
        x: 160,
        y: 70,
        z: -80,
        world: 'nether',
        chunk: chunkCoords
      };
      
      expect(position.x).toBe(160);
      expect(position.y).toBe(70);
      expect(position.z).toBe(-80);
      expect(position.world).toBe('nether');
      expect(position.chunk.chunkX).toBe(10);
      expect(position.chunk.chunkZ).toBe(-5);
    });
    
    it('should handle negative coordinates', () => {
      const position: BlockPosition = {
        x: -500,
        y: 64,
        z: -1000,
        world: 'overworld',
        chunk: { chunkX: -32, chunkZ: -63 }
      };
      
      expect(position.x).toBe(-500);
      expect(position.z).toBe(-1000);
      expect(position.chunk.chunkX).toBe(-32);
      expect(position.chunk.chunkZ).toBe(-63);
    });
  });
  
  describe('BaseCrop Abstract Class', () => {
    it('should provide common functionality to all crops', () => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const crop = new OatCrop('base-test', position);
      
      // Test methods from BaseCrop
      expect(crop.getStageTime()).toBeGreaterThan(0);
      expect(crop.isMature()).toBe(false);
      expect(crop.getVisualProperties()).toBeDefined();
    });
    
    it('should calculate correct stage time', () => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const crop = new OatCrop('stage-time-test', position);
      
      // For oats: 4 days = 345,600 seconds, distributed equally across 4 stages
      // Each stage should be 345,600 * 0.25 = 86,400 seconds
      const expectedStageTime = 345600 * 0.25;
      expect(crop.getStageTime()).toBe(expectedStageTime);
    });
    
    it('should correctly identify mature crops', () => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const crop = new OatCrop('maturity-test', position);
      
      expect(crop.isMature()).toBe(false);
      
      // Manually set to stage 4 (maturity)
      crop.stage = 4;
      expect(crop.isMature()).toBe(true);
      
      // Should not go beyond stage 4
      crop.stage = 5;
      expect(crop.isMature()).toBe(true);
    });
  });
  
  describe('OatCrop Specific Implementation', () => {
    it('should use oat-specific configuration', () => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const crop = new OatCrop('oat-config-test', position);
      
      // Verify oat-specific visual properties
      const stage1Visual = crop.getVisualProperties();
      expect(stage1Visual?.color).toBe('#90EE90'); // Lime green for stage 1
      expect(stage1Visual?.height).toBe(0.15);
      expect(stage1Visual?.orientation).toBe('UPRIGHT');
    });
    
    it('should have drooping orientation at maturity', () => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const crop = new OatCrop('drooping-test', position);
      crop.stage = 4; // Set to maturity
      
      const stage4Visual = crop.getVisualProperties();
      expect(stage4Visual?.orientation).toBe('DROOPING');
      expect(stage4Visual?.color).toBe('#DAA520'); // Golden beige
    });
  });
  
  describe('Generic Serialization/Deserialization', () => {
    it('should serialize crop to JSON', () => {
      const position: BlockPosition = {
        x: 123,
        y: 65,
        z: 456,
        world: 'overworld',
        chunk: { chunkX: 7, chunkZ: 28 }
      };
      
      const crop = new OatCrop('serialize-test', position);
      crop.stage = 2;
      crop.stageProgress = 50000;
      crop.totalAge = 100000;
      
      const json = crop.toJSON();
      
      expect(json.id).toBe('serialize-test');
      expect(json.position).toEqual(position);
      expect(json.stage).toBe(2);
      expect(json.stageProgress).toBe(50000);
      expect(json.totalAge).toBe(100000);
      expect(json.plantedAt).toBeDefined();
      expect(json.lastUpdateTime).toBeDefined();
    });
    
    it('should deserialize crop from JSON', () => {
      const position: BlockPosition = {
        x: 789,
        y: 64,
        z: 101,
        world: 'overworld',
        chunk: { chunkX: 49, chunkZ: 6 }
      };
      
      const saveData: CropSaveData = {
        id: 'deserialize-test',
        position: position,
        stage: 3,
        stageProgress: 75000,
        totalAge: 250000,
        plantedAt: Date.now() - 300000,
        lastUpdateTime: Date.now() - 1000
      };
      
      const crop = OatCrop.fromSaveData(saveData);
      
      expect(crop.id).toBe('deserialize-test');
      expect(crop.position).toEqual(position);
      expect(crop.stage).toBe(3);
      expect(crop.stageProgress).toBe(75000);
      expect(crop.totalAge).toBe(250000);
      expect(crop.plantedAt).toBe(saveData.plantedAt);
      expect(crop.lastUpdateTime).toBe(saveData.lastUpdateTime);
    });
    
    it('should maintain data integrity through round-trip serialization', () => {
      const position: BlockPosition = {
        x: 999,
        y: 70,
        z: -888,
        world: 'overworld',
        chunk: { chunkX: 62, chunkZ: -56 }
      };
      
      const originalCrop = new OatCrop('roundtrip-test', position);
      originalCrop.stage = 4;
      originalCrop.stageProgress = 86400;
      originalCrop.totalAge = 345600;
      
      // Serialize
      const json = originalCrop.toJSON();
      
      // Deserialize
      const restoredCrop = OatCrop.fromSaveData(json);
      
      // Verify all properties match
      expect(restoredCrop.id).toBe(originalCrop.id);
      expect(restoredCrop.position).toEqual(originalCrop.position);
      expect(restoredCrop.stage).toBe(originalCrop.stage);
      expect(restoredCrop.stageProgress).toBe(originalCrop.stageProgress);
      expect(restoredCrop.totalAge).toBe(originalCrop.totalAge);
      expect(restoredCrop.plantedAt).toBe(originalCrop.plantedAt);
      expect(restoredCrop.lastUpdateTime).toBe(originalCrop.lastUpdateTime);
    });
    
    it('should restore visual properties after deserialization', () => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const saveData: CropSaveData = {
        id: 'visual-restore-test',
        position: position,
        stage: 2,
        stageProgress: 0,
        totalAge: 86400,
        plantedAt: Date.now(),
        lastUpdateTime: Date.now()
      };
      
      const crop = OatCrop.fromSaveData(saveData);
      
      // Visual height should be restored based on stage
      expect(crop.visualHeight).toBe(0.40); // Stage 2 height for oats
      
      const visual = crop.getVisualProperties();
      expect(visual?.color).toBe('#228B22'); // Forest green for stage 2
    });
    
    it('should handle stage 4 height variation after deserialization', () => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const saveData: CropSaveData = {
        id: 'height-variation-test',
        position: position,
        stage: 4,
        stageProgress: 0,
        totalAge: 345600,
        plantedAt: Date.now(),
        lastUpdateTime: Date.now()
      };
      
      const crop = OatCrop.fromSaveData(saveData);
      
      // Stage 4 has height variation: 0.90 + random(0.10) = 0.90-1.00
      expect(crop.visualHeight).toBeGreaterThanOrEqual(0.90);
      expect(crop.visualHeight).toBeLessThanOrEqual(1.00);
    });
  });
  
  describe('Generic Crop System Architecture', () => {
    it('should allow BaseCrop to be extended for other crop types', () => {
      // This test verifies that the architecture is generic and extensible
      // OatCrop extends BaseCrop, demonstrating the pattern for future crops
      
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const oatCrop = new OatCrop('extensibility-test', position);
      
      // Verify that OatCrop is an instance of BaseCrop
      expect(oatCrop).toBeInstanceOf(BaseCrop);
      
      // Verify that it implements ICrop
      const asCrop: ICrop = oatCrop;
      expect(asCrop.id).toBeDefined();
      expect(asCrop.position).toBeDefined();
      expect(asCrop.stage).toBeDefined();
    });
  });
});
