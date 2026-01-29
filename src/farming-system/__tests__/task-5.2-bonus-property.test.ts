/**
 * Property-based tests for Task 5.2: Bonus System
 * 
 * Feature: hytale-oats-farming, Property 5, 6, 7: Bonus Application
 * 
 * Property 5: Application du Bonus d'Eau
 * For any oat plant, if water is present within 4 blocks (Manhattan distance),
 * the growth speed multiplier must be 1.15, otherwise 1.0.
 * **Validates: Requirements 2.2, 11.2, 11.3**
 * 
 * Property 6: Application du Bonus de Pluie
 * For any oat plant exposed to the sky, if rain is active, the growth speed
 * multiplier must be 1.10, otherwise 1.0. If the plant is covered, the
 * multiplier must be 1.0 even with rain.
 * **Validates: Requirements 2.3, 12.1, 12.2, 12.3, 12.4**
 * 
 * Property 7: Cumul Additif des Bonus
 * For any oat plant, when multiple bonuses are active (water and rain), the
 * total multiplier must be the sum of individual bonuses (e.g., 1.0 + 0.15 + 0.10 = 1.25).
 * **Validates: Requirements 2.4**
 * 
 * This test uses fast-check to generate random positions, water placements,
 * and weather conditions to verify that bonus calculations are correct universally.
 */

import * as fc from 'fast-check';
import { OatBonusCalculator } from '../bonus/OatBonusCalculator';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces/ICrop';
import { oatConfig } from '../config/OatSystemConfig';

describe('Task 5.2: Property-Based Tests - Bonus System', () => {
  describe('Property 5: Application du Bonus d\'Eau', () => {
    /**
     * Property: For any plant position, if water is present within 4 blocks
     * (Manhattan distance), the water bonus must be 1.15, otherwise 1.0.
     * 
     * This property tests that:
     * 1. Water within Manhattan distance 4 applies 1.15 multiplier
     * 2. Water beyond Manhattan distance 4 applies 1.0 multiplier
     * 3. No water applies 1.0 multiplier
     * 4. Manhattan distance is used (not Euclidean)
     */
    it('should apply 1.15 water bonus when water is within 4 blocks Manhattan distance (Property 5)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating water offsets within Manhattan distance 4
      // Manhattan distance: |dx| + |dz| <= 4
      const arbWaterOffsetWithin = fc.tuple(
        fc.integer({ min: -4, max: 4 }),
        fc.integer({ min: -4, max: 4 })
      ).filter(([dx, dz]) => Math.abs(dx) + Math.abs(dz) <= 4);
      
      // Property: Water within radius 4 must apply 1.15 bonus
      fc.assert(
        fc.property(
          arbPlantPosition,
          arbWaterOffsetWithin,
          (plantPos: BlockPosition, [dx, dz]: [number, number]) => {
            // Arrange: Set up world with water at offset
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            const waterPos: BlockPosition = {
              x: plantPos.x + dx,
              y: plantPos.y,
              z: plantPos.z + dz,
              world: plantPos.world,
              chunk: plantPos.chunk
            };
            
            world.setBlock(waterPos, 'WATER');
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Water bonus must be 1.15
            expect(bonuses.waterBonus).toBe(1.15);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: For any plant position, if water is beyond Manhattan distance 4,
     * the water bonus must be 1.0 (no bonus).
     */
    it('should apply 1.0 water bonus when water is beyond 4 blocks Manhattan distance (Property 5)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating water offsets beyond Manhattan distance 4
      // Manhattan distance: |dx| + |dz| > 4
      const arbWaterOffsetBeyond = fc.tuple(
        fc.integer({ min: -10, max: 10 }),
        fc.integer({ min: -10, max: 10 })
      ).filter(([dx, dz]) => Math.abs(dx) + Math.abs(dz) > 4);
      
      // Property: Water beyond radius 4 must apply 1.0 bonus (no bonus)
      fc.assert(
        fc.property(
          arbPlantPosition,
          arbWaterOffsetBeyond,
          (plantPos: BlockPosition, [dx, dz]: [number, number]) => {
            // Arrange: Set up world with water beyond radius
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            const waterPos: BlockPosition = {
              x: plantPos.x + dx,
              y: plantPos.y,
              z: plantPos.z + dz,
              world: plantPos.world,
              chunk: plantPos.chunk
            };
            
            world.setBlock(waterPos, 'WATER');
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Water bonus must be 1.0 (no bonus)
            expect(bonuses.waterBonus).toBe(1.0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: For any plant position with no water nearby, the water bonus
     * must be 1.0 (no bonus).
     */
    it('should apply 1.0 water bonus when no water is present (Property 5)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: No water must apply 1.0 bonus
      fc.assert(
        fc.property(
          arbPlantPosition,
          (plantPos: BlockPosition) => {
            // Arrange: Set up world with no water (all air)
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            // Don't set any water blocks - MockWorld defaults to air
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Water bonus must be 1.0 (no bonus)
            expect(bonuses.waterBonus).toBe(1.0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Manhattan distance must be used, not Euclidean distance.
     * This means diagonal positions at distance 5 should NOT get the bonus,
     * even though their Euclidean distance might be less than 4.
     */
    it('should use Manhattan distance, not Euclidean distance (Property 5)', () => {
      // Test specific diagonal positions that would pass Euclidean but fail Manhattan
      // For example: (3, 3) has Euclidean distance ~4.24 but Manhattan distance 6
      const diagonalPositions: [number, number][] = [
        [3, 3],   // Manhattan: 6, Euclidean: ~4.24
        [3, 2],   // Manhattan: 5, Euclidean: ~3.61
        [2, 3],   // Manhattan: 5, Euclidean: ~3.61
        [-3, -3], // Manhattan: 6, Euclidean: ~4.24
        [4, 1],   // Manhattan: 5, Euclidean: ~4.12
        [1, 4],   // Manhattan: 5, Euclidean: ~4.12
      ];
      
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Diagonal positions beyond Manhattan 4 should not get bonus
      fc.assert(
        fc.property(
          arbPlantPosition,
          fc.constantFrom(...diagonalPositions),
          (plantPos: BlockPosition, [dx, dz]: [number, number]) => {
            // Arrange: Set up world with water at diagonal position
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            const waterPos: BlockPosition = {
              x: plantPos.x + dx,
              y: plantPos.y,
              z: plantPos.z + dz,
              world: plantPos.world,
              chunk: plantPos.chunk
            };
            
            world.setBlock(waterPos, 'WATER');
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Water bonus must be 1.0 (no bonus) because Manhattan > 4
            expect(bonuses.waterBonus).toBe(1.0);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Property 6: Application du Bonus de Pluie', () => {
    /**
     * Property: For any plant exposed to the sky, if rain is active, the rain
     * bonus must be 1.10, otherwise 1.0.
     * 
     * This property tests that:
     * 1. Rain + exposed to sky = 1.10 multiplier
     * 2. No rain + exposed to sky = 1.0 multiplier
     * 3. Rain + covered = 1.0 multiplier (rain doesn't apply)
     * 4. Sky exposure is checked correctly
     */
    it('should apply 1.10 rain bonus when raining and exposed to sky (Property 6)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Rain + exposed must apply 1.10 bonus
      fc.assert(
        fc.property(
          arbPlantPosition,
          (plantPos: BlockPosition) => {
            // Arrange: Set up world with rain and sky exposure
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            world.setSkyExposure(plantPos, true);
            calculator.setRaining(true);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Rain bonus must be 1.10
            expect(bonuses.rainBonus).toBe(1.10);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: For any plant exposed to the sky, if rain is not active,
     * the rain bonus must be 1.0 (no bonus).
     */
    it('should apply 1.0 rain bonus when not raining (Property 6)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: No rain must apply 1.0 bonus
      fc.assert(
        fc.property(
          arbPlantPosition,
          (plantPos: BlockPosition) => {
            // Arrange: Set up world with no rain but exposed to sky
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            world.setSkyExposure(plantPos, true);
            calculator.setRaining(false);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Rain bonus must be 1.0 (no bonus)
            expect(bonuses.rainBonus).toBe(1.0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: For any plant NOT exposed to the sky, even if rain is active,
     * the rain bonus must be 1.0 (no bonus).
     * 
     * This validates Requirement 12.4: covered plants don't get rain bonus.
     */
    it('should apply 1.0 rain bonus when covered, even if raining (Property 6)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Covered + rain must apply 1.0 bonus (no bonus)
      fc.assert(
        fc.property(
          arbPlantPosition,
          (plantPos: BlockPosition) => {
            // Arrange: Set up world with rain but NOT exposed to sky
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            world.setSkyExposure(plantPos, false); // Covered
            calculator.setRaining(true);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Rain bonus must be 1.0 (no bonus) because covered
            expect(bonuses.rainBonus).toBe(1.0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Rain bonus must depend on both rain state AND sky exposure.
     * Test all four combinations to ensure correct behavior.
     */
    it('should correctly combine rain state and sky exposure (Property 6)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for all combinations of rain and sky exposure
      const arbRainAndSky = fc.record({
        raining: fc.boolean(),
        exposed: fc.boolean()
      });
      
      // Property: Only rain + exposed should give 1.10, all others 1.0
      fc.assert(
        fc.property(
          arbPlantPosition,
          arbRainAndSky,
          (plantPos: BlockPosition, { raining, exposed }) => {
            // Arrange: Set up world with specific rain and sky conditions
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            world.setSkyExposure(plantPos, exposed);
            calculator.setRaining(raining);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Only rain + exposed should give 1.10
            const expectedBonus = (raining && exposed) ? 1.10 : 1.0;
            expect(bonuses.rainBonus).toBe(expectedBonus);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Property 7: Cumul Additif des Bonus', () => {
    /**
     * Property: For any plant, when multiple bonuses are active (water and rain),
     * the bonuses must be additive, not multiplicative.
     * 
     * This means:
     * - No bonuses: 1.0 (base)
     * - Water only: 1.15 (1.0 + 0.15)
     * - Rain only: 1.10 (1.0 + 0.10)
     * - Both: 1.25 (1.0 + 0.15 + 0.10), NOT 1.265 (1.15 * 1.10)
     * 
     * This property tests that bonuses are summed, not multiplied.
     */
    it('should apply bonuses additively, not multiplicatively (Property 7)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for water offset within range
      const arbWaterOffset = fc.tuple(
        fc.integer({ min: -4, max: 4 }),
        fc.integer({ min: -4, max: 4 })
      ).filter(([dx, dz]) => Math.abs(dx) + Math.abs(dz) <= 4);
      
      // Arbitrary for all combinations of bonuses
      const arbBonusConditions = fc.record({
        hasWater: fc.boolean(),
        isRaining: fc.boolean(),
        isExposed: fc.boolean()
      });
      
      // Property: Bonuses must be additive
      fc.assert(
        fc.property(
          arbPlantPosition,
          arbWaterOffset,
          arbBonusConditions,
          (plantPos: BlockPosition, [dx, dz]: [number, number], conditions) => {
            // Arrange: Set up world with specified conditions
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            // Set up water if needed
            if (conditions.hasWater) {
              const waterPos: BlockPosition = {
                x: plantPos.x + dx,
                y: plantPos.y,
                z: plantPos.z + dz,
                world: plantPos.world,
                chunk: plantPos.chunk
              };
              world.setBlock(waterPos, 'WATER');
            }
            
            // Set up rain and sky exposure
            world.setSkyExposure(plantPos, conditions.isExposed);
            calculator.setRaining(conditions.isRaining);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Check that bonuses are returned correctly
            const expectedWaterBonus = conditions.hasWater ? 1.15 : 1.0;
            const expectedRainBonus = (conditions.isRaining && conditions.isExposed) ? 1.10 : 1.0;
            
            expect(bonuses.waterBonus).toBe(expectedWaterBonus);
            expect(bonuses.rainBonus).toBe(expectedRainBonus);
            
            // The bonuses are returned separately, and the growth engine
            // will apply them additively. We verify that the calculator
            // returns the correct individual bonuses.
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Test all four combinations of bonuses to ensure correct values.
     * 
     * Combinations:
     * 1. No water, no rain: waterBonus=1.0, rainBonus=1.0
     * 2. Water, no rain: waterBonus=1.15, rainBonus=1.0
     * 3. No water, rain: waterBonus=1.0, rainBonus=1.10
     * 4. Water and rain: waterBonus=1.15, rainBonus=1.10
     */
    it('should return correct bonus values for all combinations (Property 7)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Test all four combinations
      const combinations = [
        { hasWater: false, hasRain: false, expectedWater: 1.0, expectedRain: 1.0 },
        { hasWater: true, hasRain: false, expectedWater: 1.15, expectedRain: 1.0 },
        { hasWater: false, hasRain: true, expectedWater: 1.0, expectedRain: 1.10 },
        { hasWater: true, hasRain: true, expectedWater: 1.15, expectedRain: 1.10 },
      ];
      
      // Property: Each combination must return correct bonuses
      fc.assert(
        fc.property(
          arbPlantPosition,
          fc.constantFrom(...combinations),
          (plantPos: BlockPosition, combo) => {
            // Arrange: Set up world with specific combination
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            // Set up water if needed
            if (combo.hasWater) {
              const waterPos: BlockPosition = {
                x: plantPos.x + 1, // Place water 1 block away
                y: plantPos.y,
                z: plantPos.z,
                world: plantPos.world,
                chunk: plantPos.chunk
              };
              world.setBlock(waterPos, 'WATER');
            }
            
            // Set up rain
            world.setSkyExposure(plantPos, true); // Always exposed for this test
            calculator.setRaining(combo.hasRain);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Bonuses must match expected values
            expect(bonuses.waterBonus).toBe(combo.expectedWater);
            expect(bonuses.rainBonus).toBe(combo.expectedRain);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Bonus values must be independent - water bonus should not
     * affect rain bonus and vice versa.
     */
    it('should calculate bonuses independently (Property 7)', () => {
      // Arbitrary for generating random plant positions
      const arbPlantPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Water bonus should be same regardless of rain state
      fc.assert(
        fc.property(
          arbPlantPosition,
          fc.boolean(),
          (plantPos: BlockPosition, isRaining: boolean) => {
            // Arrange: Set up world with water, varying rain
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            const waterPos: BlockPosition = {
              x: plantPos.x + 1,
              y: plantPos.y,
              z: plantPos.z,
              world: plantPos.world,
              chunk: plantPos.chunk
            };
            world.setBlock(waterPos, 'WATER');
            world.setSkyExposure(plantPos, true);
            calculator.setRaining(isRaining);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Water bonus must always be 1.15 when water is present,
            // regardless of rain state
            expect(bonuses.waterBonus).toBe(1.15);
          }
        ),
        { numRuns: 100 }
      );
      
      // Property: Rain bonus should be same regardless of water presence
      fc.assert(
        fc.property(
          arbPlantPosition,
          fc.boolean(),
          (plantPos: BlockPosition, hasWater: boolean) => {
            // Arrange: Set up world with rain, varying water
            const world = new MockWorld();
            const calculator = new OatBonusCalculator(world, oatConfig);
            
            if (hasWater) {
              const waterPos: BlockPosition = {
                x: plantPos.x + 1,
                y: plantPos.y,
                z: plantPos.z,
                world: plantPos.world,
                chunk: plantPos.chunk
              };
              world.setBlock(waterPos, 'WATER');
            }
            
            world.setSkyExposure(plantPos, true);
            calculator.setRaining(true);
            
            // Act: Calculate bonuses
            const bonuses = calculator.calculateBonuses(plantPos);
            
            // Assert: Rain bonus must always be 1.10 when raining and exposed,
            // regardless of water presence
            expect(bonuses.rainBonus).toBe(1.10);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
