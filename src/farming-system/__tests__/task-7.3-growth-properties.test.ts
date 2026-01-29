/**
 * Property-based tests for Task 7.3: Growth Engine Properties
 * 
 * Tests the universal properties of the growth engine:
 * - Property 2: Sequential Stage Progression
 * - Property 3: Stop at Maturity
 * 
 * These tests use fast-check to verify properties hold across many random inputs.
 * 
 * Requirements: 1.3, 1.4
 */

import * as fc from 'fast-check';
import { OatGrowthEngine } from '../growth/OatGrowthEngine';
import { OatCrop } from '../models/OatCrop';
import { OatConditionValidator } from '../validation/OatConditionValidator';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces';
import { oatConfig } from '../config/OatSystemConfig';
import { GrowthBonuses } from '../interfaces/ICropGrowth';

describe('Task 7.3: Growth Engine Properties', () => {
  /**
   * Property 2: Sequential Stage Progression
   * 
   * For any oat plant at a given stage (1-3), when the required time for that stage
   * is reached, the plant must progress to exactly the next stage (stage + 1).
   * 
   * Feature: hytale-oats-farming, Property 2: Sequential Stage Progression
   * Validates: Requirements 1.3
   */
  describe('Property 2: Sequential Stage Progression', () => {
    it('should always advance to exactly the next stage when time threshold is reached', () => {
      fc.assert(
        fc.property(
          // Generate random crops at stages 1-3 (not 4, since that's maturity)
          fc.record({
            stage: fc.integer({ min: 1, max: 3 }),
            position: fc.record({
              x: fc.integer({ min: -100, max: 100 }),
              y: fc.integer({ min: 0, max: 255 }),
              z: fc.integer({ min: -100, max: 100 })
            }),
            // Generate random progress that will cross the threshold
            additionalTime: fc.integer({ min: 0, max: 10000 })
          }),
          (testData) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              ...testData.position,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop at the test stage
            const crop = new OatCrop('test-crop', position);
            crop.stage = testData.stage;
            
            // Set progress to exactly at threshold
            const stageTime = 86400; // 25% of 345,600
            crop.stageProgress = stageTime;
            
            const initialStage = crop.stage;
            
            // No bonuses for this test
            const bonuses: GrowthBonuses = {
              waterBonus: 1.0,
              rainBonus: 1.0
            };
            
            // Update growth - should trigger stage advancement
            growthEngine.updateGrowth(crop, testData.additionalTime, bonuses);
            
            // Property: Stage should be exactly initialStage + 1
            // (or stay at 4 if we somehow reached it)
            if (initialStage < 4) {
              expect(crop.stage).toBe(initialStage + 1);
            } else {
              expect(crop.stage).toBe(4);
            }
          }
        ),
        { numRuns: 100 } // Run 100 times with different random inputs
      );
    });
    
    it('should never skip stages during progression', () => {
      fc.assert(
        fc.property(
          // Generate random starting conditions
          fc.record({
            initialStage: fc.integer({ min: 1, max: 3 }),
            initialProgress: fc.integer({ min: 0, max: 86400 }),
            timeToAdd: fc.integer({ min: 0, max: 200000 }), // Potentially multiple stages
            waterBonus: fc.constantFrom(1.0, 1.15),
            rainBonus: fc.constantFrom(1.0, 1.10)
          }),
          (testData) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop
            const crop = new OatCrop('test-crop', position);
            crop.stage = testData.initialStage;
            crop.stageProgress = testData.initialProgress;
            
            const initialStage = crop.stage;
            
            const bonuses: GrowthBonuses = {
              waterBonus: testData.waterBonus,
              rainBonus: testData.rainBonus
            };
            
            // Update growth
            growthEngine.updateGrowth(crop, testData.timeToAdd, bonuses);
            
            // Property: Final stage should be between initialStage and 4 (inclusive)
            expect(crop.stage).toBeGreaterThanOrEqual(initialStage);
            expect(crop.stage).toBeLessThanOrEqual(4);
            
            // Property: Stage should not increase by more than the number of stages possible
            const maxPossibleAdvancement = 4 - initialStage;
            expect(crop.stage - initialStage).toBeLessThanOrEqual(maxPossibleAdvancement);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should maintain sequential progression even with large time jumps', () => {
      fc.assert(
        fc.property(
          // Generate very large time values (enough to reach stage 4 from any starting stage)
          fc.record({
            initialStage: fc.integer({ min: 1, max: 3 }),
            largeTime: fc.integer({ min: 345600, max: 1000000 }) // At least 4 days
          }),
          (testData) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop
            const crop = new OatCrop('test-crop', position);
            crop.stage = testData.initialStage;
            crop.stageProgress = 0;
            
            const bonuses: GrowthBonuses = {
              waterBonus: 1.0,
              rainBonus: 1.0
            };
            
            // Update with large time
            growthEngine.updateGrowth(crop, testData.largeTime, bonuses);
            
            // Property: Should reach stage 4 (maturity) but not beyond
            expect(crop.stage).toBe(4);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Property 3: Stop at Maturity
   * 
   * For any oat plant at stage 4 (Maturity), regardless of additional time elapsed,
   * the stage must remain 4 and never progress beyond.
   * 
   * Feature: hytale-oats-farming, Property 3: Stop at Maturity
   * Validates: Requirements 1.4
   */
  describe('Property 3: Stop at Maturity', () => {
    it('should never progress beyond stage 4 regardless of time', () => {
      fc.assert(
        fc.property(
          // Generate random large time values
          fc.record({
            initialProgress: fc.integer({ min: 0, max: 100000 }),
            additionalTime: fc.integer({ min: 0, max: 1000000 }),
            waterBonus: fc.constantFrom(1.0, 1.15),
            rainBonus: fc.constantFrom(1.0, 1.10)
          }),
          (testData) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop at stage 4 (maturity)
            const crop = new OatCrop('test-crop', position);
            crop.stage = 4;
            crop.stageProgress = testData.initialProgress;
            
            const bonuses: GrowthBonuses = {
              waterBonus: testData.waterBonus,
              rainBonus: testData.rainBonus
            };
            
            // Update growth with potentially large time
            growthEngine.updateGrowth(crop, testData.additionalTime, bonuses);
            
            // Property: Stage must remain exactly 4
            expect(crop.stage).toBe(4);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should cap stage progress at stage time when at maturity', () => {
      fc.assert(
        fc.property(
          // Generate random time values
          fc.integer({ min: 0, max: 500000 }),
          (additionalTime) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop at stage 4
            const crop = new OatCrop('test-crop', position);
            crop.stage = 4;
            crop.stageProgress = 0;
            
            const bonuses: GrowthBonuses = {
              waterBonus: 1.0,
              rainBonus: 1.0
            };
            
            // Update growth
            growthEngine.updateGrowth(crop, additionalTime, bonuses);
            
            // Property: Stage progress should not exceed stage time
            const stageTime = 86400;
            expect(crop.stageProgress).toBeLessThanOrEqual(stageTime);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should remain at stage 4 through multiple update cycles', () => {
      fc.assert(
        fc.property(
          // Generate array of random time deltas
          fc.array(fc.integer({ min: 1000, max: 50000 }), { minLength: 5, maxLength: 20 }),
          (timeDeltas) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop at stage 4
            const crop = new OatCrop('test-crop', position);
            crop.stage = 4;
            crop.stageProgress = 0;
            
            const bonuses: GrowthBonuses = {
              waterBonus: 1.0,
              rainBonus: 1.0
            };
            
            // Apply multiple updates
            for (const delta of timeDeltas) {
              growthEngine.updateGrowth(crop, delta, bonuses);
              
              // Property: Stage must remain 4 after each update
              expect(crop.stage).toBe(4);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should stop at stage 4 even with maximum bonuses', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 100000, max: 1000000 }),
          (largeTime) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop at stage 4
            const crop = new OatCrop('test-crop', position);
            crop.stage = 4;
            crop.stageProgress = 0;
            
            // Maximum bonuses
            const bonuses: GrowthBonuses = {
              waterBonus: 1.15,
              rainBonus: 1.10
            };
            
            // Update with large time and max bonuses
            growthEngine.updateGrowth(crop, largeTime, bonuses);
            
            // Property: Stage must remain 4
            expect(crop.stage).toBe(4);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Combined property: Stage progression is monotonic and bounded
   * 
   * This test verifies that stage values only increase (never decrease)
   * and are always within valid bounds [1, 4].
   */
  describe('Combined Property: Monotonic and Bounded Progression', () => {
    it('should maintain stage within bounds [1, 4] and never decrease', () => {
      fc.assert(
        fc.property(
          // Generate a sequence of random updates
          fc.record({
            initialStage: fc.integer({ min: 1, max: 4 }),
            updates: fc.array(
              fc.record({
                deltaTime: fc.integer({ min: 0, max: 100000 }),
                waterBonus: fc.constantFrom(1.0, 1.15),
                rainBonus: fc.constantFrom(1.0, 1.10)
              }),
              { minLength: 1, maxLength: 10 }
            )
          }),
          (testData) => {
            // Setup
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            const growthEngine = new OatGrowthEngine(oatConfig, validator);
            
            const position: BlockPosition = {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            };
            
            // Set up valid growth conditions
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            world.setLightLevel(position, 15);
            
            // Create crop
            const crop = new OatCrop('test-crop', position);
            crop.stage = testData.initialStage;
            crop.stageProgress = 0;
            
            let previousStage = crop.stage;
            
            // Apply all updates
            for (const update of testData.updates) {
              const bonuses: GrowthBonuses = {
                waterBonus: update.waterBonus,
                rainBonus: update.rainBonus
              };
              
              growthEngine.updateGrowth(crop, update.deltaTime, bonuses);
              
              // Property 1: Stage is within bounds
              expect(crop.stage).toBeGreaterThanOrEqual(1);
              expect(crop.stage).toBeLessThanOrEqual(4);
              
              // Property 2: Stage never decreases (monotonic)
              expect(crop.stage).toBeGreaterThanOrEqual(previousStage);
              
              previousStage = crop.stage;
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
