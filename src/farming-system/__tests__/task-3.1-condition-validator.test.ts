/**
 * Unit tests for Task 3.1: ConditionValidator generic system
 * 
 * Tests the generic condition validation system including:
 * - IConditionValidator interface
 * - BaseConditionValidator with common logic
 * - OatConditionValidator specialization
 * - isValidSoil() configurable by crop type
 * - hasSpaceAbove() reusable for all crops
 * - canPlant() combining all validations
 * 
 * Requirements: 6.1, 6.2, 6.5
 */

import { OatConditionValidator } from '../validation/OatConditionValidator';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces';
import { oatConfig } from '../config/OatSystemConfig';

describe('Task 3.1: ConditionValidator Generic System', () => {
  let validator: OatConditionValidator;
  let world: MockWorld;
  let testPosition: BlockPosition;
  
  beforeEach(() => {
    // Create a fresh mock world for each test
    world = new MockWorld();
    
    // Create validator with oat configuration
    validator = new OatConditionValidator(oatConfig, world);
    
    // Standard test position
    testPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
  });
  
  describe('isValidSoil() - Configurable by crop type', () => {
    it('should return true when soil is FARMLAND (valid for oats)', () => {
      // Requirement 6.1: Oats require tilled soil
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'FARMLAND');
      
      expect(validator.isValidSoil(testPosition)).toBe(true);
    });
    
    it('should return true when soil is TILLED_SOIL (valid for oats)', () => {
      // Requirement 6.1: Oats require tilled soil (alternative name)
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'TILLED_SOIL');
      
      expect(validator.isValidSoil(testPosition)).toBe(true);
    });
    
    it('should return false when soil is dirt (invalid for oats)', () => {
      // Requirement 6.2: Non-tilled soil should be rejected
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'dirt');
      
      expect(validator.isValidSoil(testPosition)).toBe(false);
    });
    
    it('should return false when soil is stone (invalid for oats)', () => {
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'stone');
      
      expect(validator.isValidSoil(testPosition)).toBe(false);
    });
    
    it('should return false when soil is sand (invalid for oats)', () => {
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'sand');
      
      expect(validator.isValidSoil(testPosition)).toBe(false);
    });
    
    it('should check the block below the planting position', () => {
      // Set tilled soil one block below
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'FARMLAND');
      
      // Set stone at the planting position (shouldn't matter for soil check)
      world.setBlock(testPosition, 'stone');
      
      expect(validator.isValidSoil(testPosition)).toBe(true);
    });
  });
  
  describe('hasSpaceAbove() - Reusable for all crops', () => {
    it('should return true when space is air (available)', () => {
      // Requirement 6.5: Space above must be free
      world.setBlock(testPosition, 'air');
      
      expect(validator.hasSpaceAbove(testPosition)).toBe(true);
    });
    
    it('should return false when space is stone (obstructed)', () => {
      // Requirement 6.5: Obstructed space should be detected
      world.setBlock(testPosition, 'stone');
      
      expect(validator.hasSpaceAbove(testPosition)).toBe(false);
    });
    
    it('should return false when space is wood (obstructed)', () => {
      world.setBlock(testPosition, 'wood');
      
      expect(validator.hasSpaceAbove(testPosition)).toBe(false);
    });
    
    it('should return true when space is water (some crops might grow in water)', () => {
      // Water is considered available space for flexibility
      world.setBlock(testPosition, 'water');
      
      expect(validator.hasSpaceAbove(testPosition)).toBe(true);
    });
    
    it('should return true when space is grass (can be replaced)', () => {
      world.setBlock(testPosition, 'grass');
      
      expect(validator.hasSpaceAbove(testPosition)).toBe(true);
    });
  });
  
  describe('canPlant() - Combines all planting validations', () => {
    it('should return valid when all conditions are met', () => {
      // Set up valid conditions
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'FARMLAND');
      world.setBlock(testPosition, 'air');
      
      const result = validator.canPlant(testPosition);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });
    
    it('should return invalid with reason when soil is wrong', () => {
      // Requirement 6.2: Invalid soil should prevent planting
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'dirt');
      world.setBlock(testPosition, 'air');
      
      const result = validator.canPlant(testPosition);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('soil');
    });
    
    it('should return valid when soil is correct (space is checked separately by crop system)', () => {
      // canPlant now only checks soil, not space
      // Space checking is done separately to provide specific error messages
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'FARMLAND');
      world.setBlock(testPosition, 'stone'); // Even with obstruction, canPlant returns valid
      
      const result = validator.canPlant(testPosition);
      
      // canPlant only checks soil, so this should be valid
      expect(result.valid).toBe(true);
      
      // The crop system will check space separately using hasSpaceAbove()
      expect(validator.hasSpaceAbove(testPosition)).toBe(false);
    });
    
    it('should return invalid when both soil and space are wrong', () => {
      // Both conditions fail
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'stone');
      world.setBlock(testPosition, 'wood');
      
      const result = validator.canPlant(testPosition);
      
      expect(result.valid).toBe(false);
      // Should fail on soil check first
      expect(result.reason).toContain('soil');
    });
  });
  
  describe('getLightLevel() - Access world light data', () => {
    it('should return the light level from the world', () => {
      world.setLightLevel(testPosition, 12);
      
      expect(validator.getLightLevel(testPosition)).toBe(12);
    });
    
    it('should return 15 for full sunlight (default)', () => {
      // Default light level in MockWorld is 15
      expect(validator.getLightLevel(testPosition)).toBe(15);
    });
    
    it('should return 0 for complete darkness', () => {
      world.setLightLevel(testPosition, 0);
      
      expect(validator.getLightLevel(testPosition)).toBe(0);
    });
  });
  
  describe('isExposedToSky() - Check sky exposure', () => {
    it('should return true when exposed to sky', () => {
      world.setSkyExposure(testPosition, true);
      
      expect(validator.isExposedToSky(testPosition)).toBe(true);
    });
    
    it('should return false when covered', () => {
      world.setSkyExposure(testPosition, false);
      
      expect(validator.isExposedToSky(testPosition)).toBe(false);
    });
    
    it('should return true by default (MockWorld default)', () => {
      expect(validator.isExposedToSky(testPosition)).toBe(true);
    });
  });
  
  describe('canGrow() - Check growth conditions', () => {
    it('should return valid when light and space are sufficient', () => {
      // Set up valid growth conditions
      world.setLightLevel(testPosition, 12); // Above minimum of 9
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });
    
    it('should return invalid when light is too low', () => {
      // Light level 8 is below the minimum of 9 for oats
      world.setLightLevel(testPosition, 8);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('light');
    });
    
    it('should return invalid when space is obstructed', () => {
      world.setLightLevel(testPosition, 12);
      const abovePosition = { ...testPosition, y: testPosition.y + 1 };
      world.setBlock(abovePosition, 'stone');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('obstructed');
    });
    
    it('should return valid when light is exactly at minimum (9)', () => {
      // Edge case: exactly at the minimum threshold
      world.setLightLevel(testPosition, 9);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(true);
    });
  });
  
  describe('Task 3.5: Light Boundary Cases - Unit Tests', () => {
    /**
     * These tests validate the exact boundary conditions for light requirements.
     * Requirements 6.3, 6.4: Light level must be >= 9 for growth.
     */
    
    it('should allow growth when light level is exactly 9 (minimum threshold)', () => {
      // Requirement 6.3: Light level >= 9 allows growth
      // This is the exact minimum - should ALLOW growth
      world.setLightLevel(testPosition, 9);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });
    
    it('should block growth when light level is exactly 8 (below threshold)', () => {
      // Requirement 6.4: Light level < 9 blocks growth
      // This is one below the minimum - should BLOCK growth
      world.setLightLevel(testPosition, 8);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toBeDefined();
      expect(result.reason).toContain('light');
    });
    
    it('should allow growth when light level is 10 (above threshold)', () => {
      // Additional verification: one above minimum should also work
      world.setLightLevel(testPosition, 10);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });
    
    it('should block growth when light level is 7 (well below threshold)', () => {
      // Additional verification: further below minimum should also block
      world.setLightLevel(testPosition, 7);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('light');
    });
    
    it('should allow growth at maximum light level (15)', () => {
      // Verify full sunlight works
      world.setLightLevel(testPosition, 15);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(true);
      expect(result.reason).toBeUndefined();
    });
    
    it('should block growth at minimum light level (0)', () => {
      // Verify complete darkness blocks growth
      world.setLightLevel(testPosition, 0);
      world.setBlock(testPosition, 'air');
      
      const result = validator.canGrow(testPosition);
      
      expect(result.valid).toBe(false);
      expect(result.reason).toContain('light');
    });
  });
  
  describe('Integration: Complete planting and growth validation', () => {
    it('should validate a complete planting scenario', () => {
      // Set up a perfect planting scenario
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'FARMLAND');
      world.setBlock(testPosition, 'air');
      world.setLightLevel(testPosition, 15);
      world.setSkyExposure(testPosition, true);
      
      // Check planting
      const plantResult = validator.canPlant(testPosition);
      expect(plantResult.valid).toBe(true);
      
      // Check growth
      const growResult = validator.canGrow(testPosition);
      expect(growResult.valid).toBe(true);
      
      // Check environmental data
      expect(validator.getLightLevel(testPosition)).toBe(15);
      expect(validator.isExposedToSky(testPosition)).toBe(true);
    });
    
    it('should handle a scenario where planting is valid but growth is blocked', () => {
      // Valid for planting
      const soilPosition = { ...testPosition, y: testPosition.y - 1 };
      world.setBlock(soilPosition, 'FARMLAND');
      world.setBlock(testPosition, 'air');
      
      // But too dark for growth
      world.setLightLevel(testPosition, 5);
      
      const plantResult = validator.canPlant(testPosition);
      expect(plantResult.valid).toBe(true);
      
      const growResult = validator.canGrow(testPosition);
      expect(growResult.valid).toBe(false);
      expect(growResult.reason).toContain('light');
    });
  });
  
  describe('Generic design validation', () => {
    it('should work with the generic IConditionValidator interface', () => {
      // This test verifies that the validator implements the interface correctly
      const genericValidator = validator as any; // Type as generic interface
      
      expect(typeof genericValidator.canPlant).toBe('function');
      expect(typeof genericValidator.isValidSoil).toBe('function');
      expect(typeof genericValidator.hasSpaceAbove).toBe('function');
      expect(typeof genericValidator.canGrow).toBe('function');
      expect(typeof genericValidator.getLightLevel).toBe('function');
      expect(typeof genericValidator.isExposedToSky).toBe('function');
    });
    
    it('should be extensible for other crop types', () => {
      // This test documents how the system can be extended
      // For example, a rice crop might need water-adjacent soil
      
      // The base validator provides the foundation
      expect(validator).toBeInstanceOf(OatConditionValidator);
      
      // And can be customized by overriding methods
      // (This is demonstrated in the comments in OatConditionValidator.ts)
    });
  });
});
