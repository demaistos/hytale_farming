/**
 * Property-based test for Task 3.2: Soil Validation
 * 
 * Feature: hytale-oats-farming, Property 17: Validation du Sol
 * 
 * Property 17: For any planting attempt, if the block below is not Terre_Labourée 
 * (tilled soil), planting must fail.
 * 
 * **Validates: Requirements 6.1, 6.2**
 * 
 * Requirements:
 * - 6.1: When an oat seed is planted, the validator must verify that the block 
 *        below is tilled soil (Terre_Labourée)
 * - 6.2: When an oat seed is planted on an invalid block, the system must 
 *        prevent planting
 * 
 * This test uses fast-check to generate random positions and soil types to verify
 * that the soil validation property holds universally.
 */

import * as fc from 'fast-check';
import { OatConditionValidator } from '../validation/OatConditionValidator';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces/ICrop';
import { oatConfig } from '../config/OatSystemConfig';

describe('Task 3.2: Property-Based Test - Soil Validation', () => {
  describe('Property 17: Validation du Sol', () => {
    /**
     * Property: For any planting attempt, if the block below is not tilled soil,
     * planting must fail.
     * 
     * This property tests that:
     * 1. Valid soil types (FARMLAND, TILLED_SOIL) allow planting
     * 2. Invalid soil types (dirt, stone, sand, etc.) prevent planting
     * 3. The validation is consistent across all positions
     */
    it('should reject planting when soil is not tilled (Property 17)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }), // y must be > 0 to have a block below
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating invalid soil types
      // These are common block types that are NOT tilled soil
      const arbInvalidSoilType = fc.oneof(
        fc.constant('dirt'),
        fc.constant('stone'),
        fc.constant('sand'),
        fc.constant('gravel'),
        fc.constant('grass_block'),
        fc.constant('cobblestone'),
        fc.constant('wood'),
        fc.constant('air'),
        fc.constant('water'),
        fc.constant('lava')
      );
      
      // Property: For any position and invalid soil type, planting must fail
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbInvalidSoilType,
          (position: BlockPosition, invalidSoilType: string) => {
            // Arrange: Set up world with invalid soil
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, invalidSoilType);
            world.setBlock(position, 'air'); // Space above is clear
            
            // Act: Check if planting is allowed
            const result = validator.canPlant(position);
            
            // Assert: Planting must fail with invalid soil
            expect(result.valid).toBe(false);
            expect(result.reason).toBeDefined();
            expect(result.reason).toContain('soil');
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in requirements
      );
    });
    
    /**
     * Property: For any planting attempt with valid tilled soil, soil validation
     * must pass (though planting might still fail for other reasons).
     * 
     * This tests the positive case: valid soil types should pass soil validation.
     */
    it('should accept planting when soil is tilled (Property 17 - positive case)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating valid soil types
      // According to OatSystemConfig, valid soil types are FARMLAND and TILLED_SOIL
      const arbValidSoilType = fc.oneof(
        fc.constant('FARMLAND'),
        fc.constant('TILLED_SOIL')
      );
      
      // Property: For any position and valid soil type, soil validation must pass
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbValidSoilType,
          (position: BlockPosition, validSoilType: string) => {
            // Arrange: Set up world with valid soil
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, validSoilType);
            world.setBlock(position, 'air'); // Space above is clear
            
            // Act: Check if planting is allowed
            const result = validator.canPlant(position);
            
            // Assert: Soil validation must pass (valid = true)
            // Note: canPlant checks both soil AND space, so if both are valid,
            // the result should be valid
            expect(result.valid).toBe(true);
            expect(result.reason).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Soil validation must check the block BELOW the planting position,
     * not the planting position itself.
     * 
     * This tests that the validator correctly identifies the soil position.
     */
    it('should check the block below the planting position (Property 17 - position check)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Validator must check y-1, not y
      fc.assert(
        fc.property(
          arbBlockPosition,
          (position: BlockPosition) => {
            // Arrange: Set up world with valid soil BELOW and invalid block AT position
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND'); // Valid soil below
            world.setBlock(position, 'air'); // Air at planting position
            
            // Act: Check if planting is allowed
            const result = validator.canPlant(position);
            
            // Assert: Should be valid because soil BELOW is correct
            expect(result.valid).toBe(true);
            
            // Now test the opposite: invalid soil below, but valid block at position
            world.setBlock(soilPosition, 'stone'); // Invalid soil below
            world.setBlock(position, 'air'); // Still air at position
            
            const result2 = validator.canPlant(position);
            
            // Assert: Should be invalid because soil BELOW is wrong
            expect(result2.valid).toBe(false);
            expect(result2.reason).toContain('soil');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Soil validation must be case-sensitive for block types.
     * 
     * This ensures that only exact matches of valid soil types are accepted.
     */
    it('should be case-sensitive for soil type validation (Property 17 - case sensitivity)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating case variations of valid soil types
      const arbInvalidCaseVariation = fc.oneof(
        fc.constant('farmland'),      // lowercase
        fc.constant('Farmland'),      // mixed case
        fc.constant('FarmLand'),      // mixed case
        fc.constant('tilled_soil'),   // lowercase
        fc.constant('Tilled_Soil'),   // mixed case
        fc.constant('TILLED_soil')    // mixed case
      );
      
      // Property: Only exact case matches should be accepted
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbInvalidCaseVariation,
          (position: BlockPosition, invalidCase: string) => {
            // Arrange: Set up world with wrong case soil type
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, invalidCase);
            world.setBlock(position, 'air');
            
            // Act: Check if planting is allowed
            const result = validator.canPlant(position);
            
            // Assert: Should fail because case doesn't match exactly
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('soil');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Soil validation must work consistently across all world coordinates.
     * 
     * This tests that the validation logic doesn't depend on specific coordinates.
     */
    it('should validate soil consistently across all coordinates (Property 17 - coordinate independence)', () => {
      // Arbitrary for generating extreme coordinates
      const arbExtremePosition = fc.record({
        x: fc.integer({ min: -30000000, max: 30000000 }),
        y: fc.integer({ min: 1, max: 254 }),
        z: fc.integer({ min: -30000000, max: 30000000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -10000, max: 10000 }),
          chunkZ: fc.integer({ min: -10000, max: 10000 })
        })
      });
      
      // Property: Validation should work the same at any coordinate
      fc.assert(
        fc.property(
          arbExtremePosition,
          (position: BlockPosition) => {
            // Arrange: Test with valid soil
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            const soilPosition = { ...position, y: position.y - 1 };
            world.setBlock(soilPosition, 'FARMLAND');
            world.setBlock(position, 'air');
            
            // Act & Assert: Should be valid
            const validResult = validator.canPlant(position);
            expect(validResult.valid).toBe(true);
            
            // Arrange: Test with invalid soil
            world.setBlock(soilPosition, 'stone');
            
            // Act & Assert: Should be invalid
            const invalidResult = validator.canPlant(position);
            expect(invalidResult.valid).toBe(false);
            expect(invalidResult.reason).toContain('soil');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
