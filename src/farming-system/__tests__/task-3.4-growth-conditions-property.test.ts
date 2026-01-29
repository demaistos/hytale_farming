/**
 * Property-based tests for Task 3.4: Growth Conditions
 * 
 * Feature: hytale-oats-farming, Property 18: Exigence de Lumière pour la Croissance
 * Feature: hytale-oats-farming, Property 19: Exigence d'Espace Libre
 * 
 * Property 18: For any oat plant, if the light level at its position is less than 9,
 * growth must be suspended (progression = 0).
 * 
 * **Validates: Requirements 6.3, 6.4**
 * 
 * Property 19: For any oat plant, if the space above the plant is obstructed by a
 * solid block, growth must be suspended (progression = 0).
 * 
 * **Validates: Requirements 6.5, 6.6**
 * 
 * Requirements:
 * - 6.3: When an oat plant attempts to grow, the validator must verify that the
 *        light level is greater than or equal to 9
 * - 6.4: When the light level is less than 9, the growth engine must suspend
 *        plant growth
 * - 6.5: When an oat plant attempts to grow, the validator must verify that the
 *        space above the plant is free
 * - 6.6: When the space above is obstructed, the growth engine must suspend
 *        plant growth
 * 
 * This test uses fast-check to generate random positions, light levels, and
 * obstructions to verify that the growth condition properties hold universally.
 */

import * as fc from 'fast-check';
import { OatConditionValidator } from '../validation/OatConditionValidator';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces/ICrop';
import { oatConfig } from '../config/OatSystemConfig';

describe('Task 3.4: Property-Based Tests - Growth Conditions', () => {
  describe('Property 18: Exigence de Lumière pour la Croissance', () => {
    /**
     * Property: For any oat plant, if the light level at its position is less
     * than 9, growth must be suspended.
     * 
     * This property tests that:
     * 1. Light levels below 9 prevent growth (canGrow returns false)
     * 2. Light levels at or above 9 allow growth (canGrow returns true)
     * 3. The validation is consistent across all positions
     */
    it('should suspend growth when light level is below 9 (Property 18)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating light levels below the minimum (0-8)
      const arbInsufficientLight = fc.integer({ min: 0, max: 8 });
      
      // Property: For any position with light < 9, growth must be suspended
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbInsufficientLight,
          (position: BlockPosition, lightLevel: number) => {
            // Arrange: Set up world with insufficient light
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            world.setLightLevel(position, lightLevel);
            world.setBlock(position, 'air'); // Space is clear
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Growth must be suspended (valid = false)
            expect(result.valid).toBe(false);
            expect(result.reason).toBeDefined();
            expect(result.reason).toContain('light');
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in requirements
      );
    });
    
    /**
     * Property: For any oat plant with light level >= 9, light validation
     * must pass (though growth might still be blocked for other reasons).
     * 
     * This tests the positive case: sufficient light should pass light validation.
     */
    it('should allow growth when light level is at or above 9 (Property 18 - positive case)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating light levels at or above minimum (9-15)
      const arbSufficientLight = fc.integer({ min: 9, max: 15 });
      
      // Property: For any position with light >= 9 and clear space, growth must be allowed
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbSufficientLight,
          (position: BlockPosition, lightLevel: number) => {
            // Arrange: Set up world with sufficient light and clear space
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            world.setLightLevel(position, lightLevel);
            world.setBlock(position, 'air'); // Space is clear
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Growth must be allowed (valid = true)
            expect(result.valid).toBe(true);
            expect(result.reason).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Light level 9 is the exact threshold - it should allow growth.
     * 
     * This tests the boundary condition at the minimum light level.
     */
    it('should allow growth at exactly light level 9 (Property 18 - boundary case)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Light level exactly 9 should allow growth
      fc.assert(
        fc.property(
          arbBlockPosition,
          (position: BlockPosition) => {
            // Arrange: Set up world with light level exactly at threshold
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            world.setLightLevel(position, 9); // Exactly at minimum
            world.setBlock(position, 'air'); // Space is clear
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Growth must be allowed at the threshold
            expect(result.valid).toBe(true);
            expect(result.reason).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Light validation must work consistently across all world coordinates.
     * 
     * This tests that the validation logic doesn't depend on specific coordinates.
     */
    it('should validate light consistently across all coordinates (Property 18 - coordinate independence)', () => {
      // Arbitrary for generating extreme coordinates
      const arbExtremePosition = fc.record({
        x: fc.integer({ min: -30000000, max: 30000000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -30000000, max: 30000000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -10000, max: 10000 }),
          chunkZ: fc.integer({ min: -10000, max: 10000 })
        })
      });
      
      // Arbitrary for generating any light level
      const arbLightLevel = fc.integer({ min: 0, max: 15 });
      
      // Property: Validation should work the same at any coordinate
      fc.assert(
        fc.property(
          arbExtremePosition,
          arbLightLevel,
          (position: BlockPosition, lightLevel: number) => {
            // Arrange: Set up world with given light level
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            world.setLightLevel(position, lightLevel);
            world.setBlock(position, 'air'); // Space is clear
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Result should depend only on light level, not coordinates
            if (lightLevel >= 9) {
              expect(result.valid).toBe(true);
            } else {
              expect(result.valid).toBe(false);
              expect(result.reason).toContain('light');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Light level must be checked at the plant's position, not elsewhere.
     * 
     * This ensures the validator checks the correct position.
     */
    it('should check light level at the plant position (Property 18 - position check)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }), // Not at world boundaries
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Only the light at the plant position matters
      fc.assert(
        fc.property(
          arbBlockPosition,
          (position: BlockPosition) => {
            // Arrange: Set up world with different light levels at different positions
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            // Set low light at plant position
            world.setLightLevel(position, 5);
            world.setBlock(position, 'air');
            
            // Set high light at adjacent positions (should not matter)
            world.setLightLevel({ ...position, x: position.x + 1 }, 15);
            world.setLightLevel({ ...position, y: position.y + 1 }, 15);
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Should be blocked because light at plant position is low
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('light');
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  describe('Property 19: Exigence d\'Espace Libre', () => {
    /**
     * Property: For any oat plant, if the space above is obstructed by a solid
     * block, growth must be suspended.
     * 
     * This property tests that:
     * 1. Solid blocks above prevent growth (canGrow returns false)
     * 2. Air or non-solid blocks above allow growth (canGrow returns true)
     * 3. The validation is consistent across all positions
     */
    it('should suspend growth when space above is obstructed (Property 19)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating solid block types that obstruct growth
      const arbSolidBlockType = fc.oneof(
        fc.constant('stone'),
        fc.constant('wood'),
        fc.constant('cobblestone'),
        fc.constant('dirt'),
        fc.constant('sand'),
        fc.constant('gravel'),
        fc.constant('glass'),
        fc.constant('brick'),
        fc.constant('iron_block'),
        fc.constant('gold_block')
      );
      
      // Property: For any position with obstructed space ABOVE, growth must be suspended
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbSolidBlockType,
          (position: BlockPosition, blockType: string) => {
            // Arrange: Set up world with obstructed space ABOVE the crop
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            const abovePosition = { ...position, y: position.y + 1 };
            world.setBlock(abovePosition, blockType); // Solid block above plant position
            world.setLightLevel(position, 15); // Light is sufficient
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Growth must be suspended (valid = false)
            expect(result.valid).toBe(false);
            expect(result.reason).toBeDefined();
            expect(result.reason).toContain('obstructed');
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in requirements
      );
    });
    
    /**
     * Property: For any oat plant with clear space above, space validation
     * must pass (though growth might still be blocked for other reasons).
     * 
     * This tests the positive case: clear space should pass space validation.
     */
    it('should allow growth when space above is clear (Property 19 - positive case)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating non-solid block types that don't obstruct
      const arbNonSolidBlockType = fc.oneof(
        fc.constant('air'),
        fc.constant('water'),
        fc.constant('grass')
      );
      
      // Property: For any position with clear space and sufficient light, growth must be allowed
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbNonSolidBlockType,
          (position: BlockPosition, blockType: string) => {
            // Arrange: Set up world with clear space and sufficient light
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            world.setBlock(position, blockType); // Non-solid block
            world.setLightLevel(position, 15); // Light is sufficient
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Growth must be allowed (valid = true)
            expect(result.valid).toBe(true);
            expect(result.reason).toBeUndefined();
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Space validation must work consistently across all world coordinates.
     * 
     * This tests that the validation logic doesn't depend on specific coordinates.
     */
    it('should validate space consistently across all coordinates (Property 19 - coordinate independence)', () => {
      // Arbitrary for generating extreme coordinates
      const arbExtremePosition = fc.record({
        x: fc.integer({ min: -30000000, max: 30000000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -30000000, max: 30000000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -10000, max: 10000 }),
          chunkZ: fc.integer({ min: -10000, max: 10000 })
        })
      });
      
      // Arbitrary for generating any block type
      const arbBlockType = fc.oneof(
        fc.constant('air'),
        fc.constant('stone'),
        fc.constant('water'),
        fc.constant('wood')
      );
      
      // Property: Validation should work the same at any coordinate
      fc.assert(
        fc.property(
          arbExtremePosition,
          arbBlockType,
          (position: BlockPosition, blockType: string) => {
            // Arrange: Set up world with given block type ABOVE the crop
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            const abovePosition = { ...position, y: position.y + 1 };
            world.setBlock(abovePosition, blockType); // Block above the crop
            world.setLightLevel(position, 15); // Light is sufficient
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Result should depend only on block type, not coordinates
            const isNonSolid = blockType === 'air' || blockType === 'water' || blockType === 'grass';
            if (isNonSolid) {
              expect(result.valid).toBe(true);
            } else {
              expect(result.valid).toBe(false);
              expect(result.reason).toContain('obstructed');
            }
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Space must be checked at the plant's position, not elsewhere.
     * 
     * This ensures the validator checks the correct position.
     */
    it('should check space at the plant position (Property 19 - position check)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 1, max: 254 }), // Not at world boundaries
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Property: Only the space ABOVE the plant position matters for growth
      fc.assert(
        fc.property(
          arbBlockPosition,
          (position: BlockPosition) => {
            // Arrange: Set up world with obstructed space ABOVE plant position
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            // Set solid block ABOVE plant position
            const abovePosition = { ...position, y: position.y + 1 };
            world.setBlock(abovePosition, 'stone');
            world.setLightLevel(position, 15);
            
            // Set air at adjacent positions (should not matter)
            world.setBlock({ ...position, x: position.x + 1 }, 'air');
            world.setBlock({ ...position, x: position.x - 1 }, 'air');
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Should be blocked because space above plant position is obstructed
            expect(result.valid).toBe(false);
            expect(result.reason).toContain('obstructed');
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Both light and space conditions must be met for growth.
     * 
     * This tests the interaction between the two growth conditions.
     */
    it('should require both light and space for growth (Property 18 & 19 - combined)', () => {
      // Arbitrary for generating random block positions
      const arbBlockPosition = fc.record({
        x: fc.integer({ min: -1000, max: 1000 }),
        y: fc.integer({ min: 0, max: 255 }),
        z: fc.integer({ min: -1000, max: 1000 }),
        world: fc.constant('overworld'),
        chunk: fc.record({
          chunkX: fc.integer({ min: -100, max: 100 }),
          chunkZ: fc.integer({ min: -100, max: 100 })
        })
      });
      
      // Arbitrary for generating light levels
      const arbLightLevel = fc.integer({ min: 0, max: 15 });
      
      // Arbitrary for generating block types
      const arbBlockType = fc.oneof(
        fc.constant('air'),
        fc.constant('stone'),
        fc.constant('water')
      );
      
      // Property: Growth requires BOTH sufficient light AND clear space ABOVE
      fc.assert(
        fc.property(
          arbBlockPosition,
          arbLightLevel,
          arbBlockType,
          (position: BlockPosition, lightLevel: number, blockType: string) => {
            // Arrange: Set up world with given conditions
            const world = new MockWorld();
            const validator = new OatConditionValidator(oatConfig, world);
            
            world.setLightLevel(position, lightLevel);
            // Set block ABOVE the crop position
            const abovePosition = { ...position, y: position.y + 1 };
            world.setBlock(abovePosition, blockType);
            
            // Act: Check if growth is allowed
            const result = validator.canGrow(position);
            
            // Assert: Growth requires both conditions
            const hasLight = lightLevel >= 9;
            const hasSpace = blockType === 'air' || blockType === 'water' || blockType === 'grass';
            
            if (hasLight && hasSpace) {
              expect(result.valid).toBe(true);
            } else {
              expect(result.valid).toBe(false);
              expect(result.reason).toBeDefined();
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
