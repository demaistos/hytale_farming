import fc from 'fast-check';
import { OatSystem } from '../system';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces';
import { GrowthStage } from '../types';

/**
 * Property-Based Tests for Crop System Initialization
 * 
 * Feature: hytale-oats-farming
 * Task: 13.2
 * 
 * Tests the initialization behavior of the crop system.
 */

describe('Task 13.2: Crop System Initialization Property Tests', () => {
  let system: OatSystem;
  let world: MockWorld;
  
  beforeEach(() => {
    world = new MockWorld();
    system = new OatSystem(world);
  });
  
  /**
   * Property 1: Initialisation au Stade 1
   * 
   * For all newly planted oat crops at valid positions,
   * the initial stage must be 1 (Germination) and the
   * stage progress must be 0.
   * 
   * Validates: Requirements 1.2
   */
  describe('Property 1: Initialization at Stage 1', () => {
    it('should initialize all planted crops at stage 1 with zero progress', () => {
      fc.assert(
        fc.property(
          // Generate random valid positions
          fc.record({
            x: fc.integer({ min: -1000, max: 1000 }),
            y: fc.integer({ min: 1, max: 255 }), // Start from 1 so y-1 is valid
            z: fc.integer({ min: -1000, max: 1000 }),
            world: fc.constant('overworld'),
            chunk: fc.record({
              chunkX: fc.integer({ min: -100, max: 100 }),
              chunkZ: fc.integer({ min: -100, max: 100 })
            })
          }),
          (position: BlockPosition) => {
            // Create fresh world and system for each iteration
            const testWorld = new MockWorld();
            const testSystem = new OatSystem(testWorld);
            
            // Setup: Configure world for valid planting
            testWorld.setBlock(position, 'air');
            const soilPos = { ...position, y: position.y - 1 };
            testWorld.setBlock(soilPos, 'TILLED_SOIL');
            testWorld.setBlock({ ...position, y: position.y + 1 }, 'air');
            testWorld.setLightLevel(position, 15);
            testWorld.setBiome(position, 'PLAINS');
            
            // Action: Plant seed
            const result = testSystem.plantSeed(position);
            
            // Assertion: Must succeed
            if (!result.success) {
              console.error('Plant failed:', result.reason, 'at', position);
              return false;
            }
            
            // Get the planted crop
            const crop = testSystem.getCrop(position);
            
            // Verify crop exists
            if (!crop) {
              console.error('Crop not found after planting at', position);
              return false;
            }
            
            // Property: Stage must be 1 (Germination)
            if (crop.stage !== GrowthStage.GERMINATION) {
              console.error(`Expected stage ${GrowthStage.GERMINATION}, got ${crop.stage}`);
              return false;
            }
            
            // Property: Stage progress must be 0
            if (crop.stageProgress !== 0) {
              console.error(`Expected stageProgress 0, got ${crop.stageProgress}`);
              return false;
            }
            
            // Property: Total age must be 0
            if (crop.totalAge !== 0) {
              console.error(`Expected totalAge 0, got ${crop.totalAge}`);
              return false;
            }
            
            return true;
          }
        ),
        { numRuns: 100 } // Run 100 iterations as per spec requirements
      );
    });
    
    it('should initialize crops with unique IDs', () => {
      fc.assert(
        fc.property(
          // Generate multiple positions
          fc.array(
            fc.record({
              x: fc.integer({ min: -1000, max: 1000 }),
              y: fc.integer({ min: 1, max: 255 }), // Start from 1 so y-1 is valid
              z: fc.integer({ min: -1000, max: 1000 }),
              world: fc.constant('overworld'),
              chunk: fc.record({
                chunkX: fc.integer({ min: -100, max: 100 }),
                chunkZ: fc.integer({ min: -100, max: 100 })
              })
            }),
            { minLength: 2, maxLength: 10 }
          ),
          (positions: BlockPosition[]) => {
            // Create fresh world and system for each iteration
            const testWorld = new MockWorld();
            const testSystem = new OatSystem(testWorld);
            
            // Setup world for all positions
            for (const position of positions) {
              testWorld.setBlock(position, 'air');
              testWorld.setBlock({ ...position, y: position.y - 1 }, 'TILLED_SOIL');
              testWorld.setBlock({ ...position, y: position.y + 1 }, 'air');
              testWorld.setLightLevel(position, 15);
              testWorld.setBiome(position, 'PLAINS');
            }
            
            // Plant all crops
            const crops = [];
            for (const position of positions) {
              const result = testSystem.plantSeed(position);
              if (result.success) {
                const crop = testSystem.getCrop(position);
                if (crop) {
                  crops.push(crop);
                }
              }
            }
            
            // Verify all IDs are unique
            const ids = crops.map(c => c.id);
            const uniqueIds = new Set(ids);
            
            return ids.length === uniqueIds.size;
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should initialize crops with correct position reference', () => {
      fc.assert(
        fc.property(
          fc.record({
            x: fc.integer({ min: -1000, max: 1000 }),
            y: fc.integer({ min: 1, max: 255 }), // Start from 1 so y-1 is valid
            z: fc.integer({ min: -1000, max: 1000 }),
            world: fc.constant('overworld'),
            chunk: fc.record({
              chunkX: fc.integer({ min: -100, max: 100 }),
              chunkZ: fc.integer({ min: -100, max: 100 })
            })
          }),
          (position: BlockPosition) => {
            // Create fresh world and system for each iteration
            const testWorld = new MockWorld();
            const testSystem = new OatSystem(testWorld);
            
            // Setup world
            testWorld.setBlock(position, 'air');
            testWorld.setBlock({ ...position, y: position.y - 1 }, 'TILLED_SOIL');
            testWorld.setBlock({ ...position, y: position.y + 1 }, 'air');
            testWorld.setLightLevel(position, 15);
            testWorld.setBiome(position, 'PLAINS');
            
            // Plant crop
            const result = testSystem.plantSeed(position);
            if (!result.success) {
              return false;
            }
            
            const crop = testSystem.getCrop(position);
            if (!crop) {
              return false;
            }
            
            // Verify position matches
            return (
              crop.position.x === position.x &&
              crop.position.y === position.y &&
              crop.position.z === position.z &&
              crop.position.world === position.world &&
              crop.position.chunk.chunkX === position.chunk.chunkX &&
              crop.position.chunk.chunkZ === position.chunk.chunkZ
            );
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
