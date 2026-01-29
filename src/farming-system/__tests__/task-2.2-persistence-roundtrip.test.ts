/**
 * Task 2.2: Property-Based Test for Persistence Round-Trip
 * 
 * Feature: hytale-oats-farming, Property 4: Persistance Round-Trip
 * 
 * **Validates: Requirements 1.5, 15.1, 15.2, 15.3, 15.4**
 * 
 * Property 4: For any crop with a given growth state, saving then restoring 
 * the crop must produce an equivalent state (same stage, same progression, 
 * same position).
 * 
 * This test uses fast-check to generate random crop states and verify that
 * serialization followed by deserialization produces an equivalent crop.
 */

import * as fc from 'fast-check';
import { OatCrop } from '../models/OatCrop';
import { BlockPosition, ChunkCoordinates } from '../interfaces/ICrop';

describe('Task 2.2: Property-Based Test - Persistence Round-Trip', () => {
  
  /**
   * Arbitrary generator for ChunkCoordinates
   */
  const arbChunkCoordinates = fc.record({
    chunkX: fc.integer({ min: -1000, max: 1000 }),
    chunkZ: fc.integer({ min: -1000, max: 1000 })
  });
  
  /**
   * Arbitrary generator for BlockPosition
   */
  const arbBlockPosition = fc.record({
    x: fc.integer({ min: -10000, max: 10000 }),
    y: fc.integer({ min: 0, max: 255 }),
    z: fc.integer({ min: -10000, max: 10000 }),
    world: fc.constantFrom('overworld', 'nether', 'end'),
    chunk: arbChunkCoordinates
  });
  
  /**
   * Arbitrary generator for OatCrop with random growth state
   * Generates crops at various stages of growth with realistic progress values
   */
  const arbOatCrop = fc.tuple(
    fc.string({ minLength: 1, maxLength: 36 }), // id
    arbBlockPosition,
    fc.integer({ min: 1, max: 4 }), // stage
    fc.float({ min: 0, max: 86400, noNaN: true }), // stageProgress (max 1 day per stage)
    fc.float({ min: 0, max: 345600, noNaN: true }), // totalAge (max 4 days total)
    fc.integer({ min: Date.now() - 1000000, max: Date.now() }), // plantedAt
    fc.integer({ min: Date.now() - 1000000, max: Date.now() }) // lastUpdateTime
  ).map(([id, position, stage, stageProgress, totalAge, plantedAt, lastUpdateTime]) => {
    const crop = new OatCrop(id, position);
    // Manually set the growth state
    crop.stage = stage;
    crop.stageProgress = stageProgress;
    crop.totalAge = totalAge;
    crop.plantedAt = plantedAt;
    crop.lastUpdateTime = lastUpdateTime;
    
    // Update visual height based on stage
    const visual = crop.getVisualProperties();
    if (visual) {
      crop.visualHeight = visual.height;
      if (visual.heightVariation && stage === 4) {
        // For stage 4, add a deterministic variation based on id
        // This ensures the same crop always has the same height
        const hash = id.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
        crop.visualHeight += (hash % 100) / 1000; // 0.00 to 0.099
      }
    }
    
    return crop;
  });
  
  /**
   * Property 4: Persistance Round-Trip
   * 
   * For any crop with a given growth state, saving then restoring the crop
   * must produce an equivalent state (same stage, same progression, same position).
   */
  it('Property 4: should maintain equivalent state through save/restore cycle', () => {
    fc.assert(
      fc.property(arbOatCrop, (originalCrop) => {
        // Step 1: Serialize the crop
        const saveData = originalCrop.toJSON();
        
        // Step 2: Deserialize to create a new crop instance
        const restoredCrop = OatCrop.fromSaveData(saveData);
        
        // Step 3: Verify all critical properties are equivalent
        
        // Identity and position must be exact
        expect(restoredCrop.id).toBe(originalCrop.id);
        expect(restoredCrop.position.x).toBe(originalCrop.position.x);
        expect(restoredCrop.position.y).toBe(originalCrop.position.y);
        expect(restoredCrop.position.z).toBe(originalCrop.position.z);
        expect(restoredCrop.position.world).toBe(originalCrop.position.world);
        expect(restoredCrop.position.chunk.chunkX).toBe(originalCrop.position.chunk.chunkX);
        expect(restoredCrop.position.chunk.chunkZ).toBe(originalCrop.position.chunk.chunkZ);
        
        // Growth state must be exact
        expect(restoredCrop.stage).toBe(originalCrop.stage);
        expect(restoredCrop.stageProgress).toBe(originalCrop.stageProgress);
        expect(restoredCrop.totalAge).toBe(originalCrop.totalAge);
        
        // Timestamps must be preserved
        expect(restoredCrop.plantedAt).toBe(originalCrop.plantedAt);
        expect(restoredCrop.lastUpdateTime).toBe(originalCrop.lastUpdateTime);
        
        // Visual properties should be recalculated correctly based on stage
        // For stages 1-3, height should be deterministic
        if (originalCrop.stage < 4) {
          expect(restoredCrop.visualHeight).toBe(originalCrop.visualHeight);
        } else {
          // For stage 4, height has variation, so we check it's in valid range
          expect(restoredCrop.visualHeight).toBeGreaterThanOrEqual(0.90);
          expect(restoredCrop.visualHeight).toBeLessThanOrEqual(1.00);
        }
        
        // Particle timer should be reset to 0 (not persisted)
        expect(restoredCrop.particleTimer).toBe(0);
      }),
      {
        numRuns: 100, // Minimum 100 iterations as specified in requirements
        verbose: false
      }
    );
  });
  
  /**
   * Additional test: Verify that multiple save/restore cycles maintain consistency
   * This ensures that the serialization is truly idempotent
   */
  it('Property 4 (Extended): should maintain consistency through multiple save/restore cycles', () => {
    fc.assert(
      fc.property(arbOatCrop, (originalCrop) => {
        // Perform 3 save/restore cycles
        let currentCrop = originalCrop;
        
        for (let i = 0; i < 3; i++) {
          const saveData = currentCrop.toJSON();
          currentCrop = OatCrop.fromSaveData(saveData);
        }
        
        // After 3 cycles, all critical properties should still match
        expect(currentCrop.id).toBe(originalCrop.id);
        expect(currentCrop.stage).toBe(originalCrop.stage);
        expect(currentCrop.stageProgress).toBe(originalCrop.stageProgress);
        expect(currentCrop.totalAge).toBe(originalCrop.totalAge);
        expect(currentCrop.plantedAt).toBe(originalCrop.plantedAt);
        expect(currentCrop.lastUpdateTime).toBe(originalCrop.lastUpdateTime);
        expect(currentCrop.position).toEqual(originalCrop.position);
      }),
      {
        numRuns: 100,
        verbose: false
      }
    );
  });
  
  /**
   * Edge case test: Verify persistence works for crops at stage boundaries
   */
  it('Property 4 (Edge Cases): should handle stage boundary conditions correctly', () => {
    const testCases = [
      { stage: 1, stageProgress: 0, description: 'newly planted' },
      { stage: 1, stageProgress: 86399.99, description: 'about to advance to stage 2' },
      { stage: 4, stageProgress: 0, description: 'just reached maturity' },
      { stage: 4, stageProgress: 86400, description: 'fully mature' },
      { stage: 4, stageProgress: 999999, description: 'overgrown (edge case)' }
    ];
    
    testCases.forEach(({ stage, stageProgress, description }) => {
      const position: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      const crop = new OatCrop(`edge-case-${description}`, position);
      crop.stage = stage;
      crop.stageProgress = stageProgress;
      crop.totalAge = (stage - 1) * 86400 + stageProgress;
      
      // Save and restore
      const saveData = crop.toJSON();
      const restored = OatCrop.fromSaveData(saveData);
      
      // Verify equivalence
      expect(restored.stage).toBe(crop.stage);
      expect(restored.stageProgress).toBe(crop.stageProgress);
      expect(restored.totalAge).toBe(crop.totalAge);
    });
  });
  
  /**
   * Edge case test: Verify persistence works with extreme coordinates
   */
  it('Property 4 (Edge Cases): should handle extreme world coordinates', () => {
    const extremePositions: BlockPosition[] = [
      {
        x: -30000000,
        y: 0,
        z: -30000000,
        world: 'overworld',
        chunk: { chunkX: -1875000, chunkZ: -1875000 }
      },
      {
        x: 30000000,
        y: 255,
        z: 30000000,
        world: 'overworld',
        chunk: { chunkX: 1875000, chunkZ: 1875000 }
      },
      {
        x: 0,
        y: 128,
        z: 0,
        world: 'nether',
        chunk: { chunkX: 0, chunkZ: 0 }
      }
    ];
    
    extremePositions.forEach((position, index) => {
      const crop = new OatCrop(`extreme-pos-${index}`, position);
      crop.stage = 2;
      crop.stageProgress = 50000;
      
      const saveData = crop.toJSON();
      const restored = OatCrop.fromSaveData(saveData);
      
      expect(restored.position).toEqual(position);
      expect(restored.stage).toBe(crop.stage);
      expect(restored.stageProgress).toBe(crop.stageProgress);
    });
  });
  
  /**
   * Test: Verify that visual properties are correctly recalculated after restore
   */
  it('Property 4 (Visual Properties): should recalculate visual properties correctly after restore', () => {
    const stages = [1, 2, 3, 4];
    const expectedHeights = [0.15, 0.40, 0.70, 0.90]; // Base heights for each stage
    const expectedColors = ['#90EE90', '#228B22', '#228B22', '#DAA520'];
    
    stages.forEach((stage, index) => {
      const position: BlockPosition = {
        x: 100,
        y: 64,
        z: 200,
        world: 'overworld',
        chunk: { chunkX: 6, chunkZ: 12 }
      };
      
      const crop = new OatCrop(`visual-test-stage-${stage}`, position);
      crop.stage = stage;
      
      const saveData = crop.toJSON();
      const restored = OatCrop.fromSaveData(saveData);
      
      const visual = restored.getVisualProperties();
      expect(visual).toBeDefined();
      expect(visual?.color).toBe(expectedColors[index]);
      
      // For stages 1-3, height should match exactly
      if (stage < 4) {
        expect(restored.visualHeight).toBe(expectedHeights[index]);
      } else {
        // For stage 4, height should be in range 0.90-1.00
        expect(restored.visualHeight).toBeGreaterThanOrEqual(0.90);
        expect(restored.visualHeight).toBeLessThanOrEqual(1.00);
      }
    });
  });
});
