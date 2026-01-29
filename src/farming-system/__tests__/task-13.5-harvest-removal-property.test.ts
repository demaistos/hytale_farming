/**
 * Property-based test for Task 13.5: Harvest Removal Property
 * 
 * Tests Property 13: Suppression après Récolte
 * For all harvested crops at any stage, verify the crop no longer exists
 * at its position after harvest.
 * 
 * Feature: hytale-oats-farming, Property 13: Suppression après Récolte
 * Validates: Requirements 4.6
 */

import * as fc from 'fast-check';
import { OatSystem } from '../system/OatSystem';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces';

describe('Task 13.5: Harvest Removal Property', () => {
  /**
   * Property 13: Suppression après Récolte
   * 
   * For all harvested crops at any stage, verify the crop no longer exists
   * at its position after harvest.
   * 
   * Feature: hytale-oats-farming, Property 13: Suppression après Récolte
   * Validates: Requirements 4.6
   */
  describe('Property 13: Suppression après Récolte', () => {
    it('should remove crop from world after harvest at any stage', () => {
      fc.assert(
        fc.property(
          // Generate random crops at any stage (1-4)
          fc.record({
            stage: fc.integer({ min: 1, max: 4 }),
            position: fc.record({
              x: fc.integer({ min: -100, max: 100 }),
              y: fc.integer({ min: 1, max: 255 }),
              z: fc.integer({ min: -100, max: 100 })
            }),
            fortuneLevel: fc.integer({ min: 0, max: 3 })
          }),
          (testData) => {
            // Setup
            const world = new MockWorld();
            const oatSystem = new OatSystem(world);
            
            const position: BlockPosition = {
              ...testData.position,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid planting conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            world.setBiome(position, 'PLAINS');
            
            // Plant the seed
            const plantResult = oatSystem.plantSeed(position);
            expect(plantResult.success).toBe(true);
            
            // Verify crop exists before harvest
            const cropBeforeHarvest = oatSystem.getCrop(position);
            expect(cropBeforeHarvest).not.toBeNull();
            
            // Set the crop to the test stage
            if (cropBeforeHarvest) {
              cropBeforeHarvest.stage = testData.stage;
            }
            
            // Mock player object
            const mockPlayer = { id: 'test-player' };
            
            // Harvest the crop
            const harvestEvent = oatSystem.onPlantHarvested(
              position,
              mockPlayer,
              testData.fortuneLevel
            );
            
            // Verify harvest event was created
            expect(harvestEvent).not.toBeNull();
            
            // Property: Crop should no longer exist at its position after harvest
            const cropAfterHarvest = oatSystem.getCrop(position);
            expect(cropAfterHarvest).toBeNull();
          }
        ),
        { numRuns: 100 } // Run 100+ iterations as specified
      );
    });
    
    it('should remove crop regardless of fortune level', () => {
      fc.assert(
        fc.property(
          // Generate random positions and fortune levels
          fc.record({
            x: fc.integer({ min: -100, max: 100 }),
            y: fc.integer({ min: 1, max: 255 }),
            z: fc.integer({ min: -100, max: 100 }),
            fortuneLevel: fc.integer({ min: 0, max: 3 })
          }),
          (testData) => {
            // Setup
            const world = new MockWorld();
            const oatSystem = new OatSystem(world);
            
            const position: BlockPosition = {
              x: testData.x,
              y: testData.y,
              z: testData.z,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid planting conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            world.setBiome(position, 'PLAINS');
            
            // Plant and grow to maturity
            const plantResult = oatSystem.plantSeed(position);
            expect(plantResult.success).toBe(true);
            
            const crop = oatSystem.getCrop(position);
            if (crop) {
              crop.stage = 4; // Set to maturity
            }
            
            // Verify crop exists
            expect(oatSystem.getCrop(position)).not.toBeNull();
            
            // Harvest with the specified fortune level
            const mockPlayer = { id: 'test-player' };
            oatSystem.onPlantHarvested(position, mockPlayer, testData.fortuneLevel);
            
            // Property: Crop should be removed regardless of fortune level
            expect(oatSystem.getCrop(position)).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should remove crop at all growth stages', () => {
      fc.assert(
        fc.property(
          // Generate all possible stages
          fc.integer({ min: 1, max: 4 }),
          (stage) => {
            // Setup
            const world = new MockWorld();
            const oatSystem = new OatSystem(world);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid planting conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            world.setBiome(position, 'PLAINS');
            
            // Plant the seed
            const plantResult = oatSystem.plantSeed(position);
            expect(plantResult.success).toBe(true);
            
            // Set to the test stage
            const crop = oatSystem.getCrop(position);
            if (crop) {
              crop.stage = stage;
            }
            
            // Verify crop exists before harvest
            expect(oatSystem.getCrop(position)).not.toBeNull();
            
            // Harvest
            const mockPlayer = { id: 'test-player' };
            oatSystem.onPlantHarvested(position, mockPlayer, 0);
            
            // Property: Crop should be removed at any stage
            expect(oatSystem.getCrop(position)).toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should allow replanting after harvest removal', () => {
      fc.assert(
        fc.property(
          // Generate random stage for first crop
          fc.integer({ min: 1, max: 4 }),
          (initialStage) => {
            // Setup
            const world = new MockWorld();
            const oatSystem = new OatSystem(world);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid planting conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            world.setBiome(position, 'PLAINS');
            
            // Plant first crop
            const firstPlant = oatSystem.plantSeed(position);
            expect(firstPlant.success).toBe(true);
            
            // Set stage and harvest
            const firstCrop = oatSystem.getCrop(position);
            if (firstCrop) {
              firstCrop.stage = initialStage;
            }
            
            const mockPlayer = { id: 'test-player' };
            oatSystem.onPlantHarvested(position, mockPlayer, 0);
            
            // Verify removal
            expect(oatSystem.getCrop(position)).toBeNull();
            
            // Property: Should be able to plant again at the same position
            const secondPlant = oatSystem.plantSeed(position);
            expect(secondPlant.success).toBe(true);
            expect(oatSystem.getCrop(position)).not.toBeNull();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should not affect other crops when one is harvested', () => {
      fc.assert(
        fc.property(
          // Generate positions for multiple crops
          fc.array(
            fc.record({
              x: fc.integer({ min: -50, max: 50 }),
              z: fc.integer({ min: -50, max: 50 })
            }),
            { minLength: 2, maxLength: 5 }
          ),
          (positions) => {
            // Ensure positions are unique
            const uniquePositions = Array.from(
              new Map(positions.map(p => [`${p.x},${p.z}`, p])).values()
            );
            
            if (uniquePositions.length < 2) {
              // Skip if we don't have at least 2 unique positions
              return true;
            }
            
            // Setup
            const world = new MockWorld();
            const oatSystem = new OatSystem(world);
            
            const y = 64;
            
            // Plant crops at all positions
            const fullPositions: BlockPosition[] = uniquePositions.map(pos => ({
              x: pos.x,
              y,
              z: pos.z,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            }));
            
            for (const position of fullPositions) {
              const soilPosition = { ...position, y: position.y - 1 };
              world.setBlock(soilPosition, 'FARMLAND');
              world.setBlock(position, 'air');
              world.setLightLevel(position, 15);
              world.setBiome(position, 'PLAINS');
              
              const plantResult = oatSystem.plantSeed(position);
              expect(plantResult.success).toBe(true);
            }
            
            // Verify all crops exist
            const initialCount = oatSystem.getCropCount();
            expect(initialCount).toBe(fullPositions.length);
            
            // Harvest the first crop
            const mockPlayer = { id: 'test-player' };
            oatSystem.onPlantHarvested(fullPositions[0], mockPlayer, 0);
            
            // Property: First crop should be removed
            expect(oatSystem.getCrop(fullPositions[0])).toBeNull();
            
            // Property: Other crops should still exist
            for (let i = 1; i < fullPositions.length; i++) {
              expect(oatSystem.getCrop(fullPositions[i])).not.toBeNull();
            }
            
            // Property: Crop count should decrease by exactly 1
            expect(oatSystem.getCropCount()).toBe(initialCount - 1);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
