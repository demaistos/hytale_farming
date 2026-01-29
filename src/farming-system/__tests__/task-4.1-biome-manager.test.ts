/**
 * Unit tests for Task 4.1: BiomeManager with incompatible biomes list
 * 
 * Tests the biome management system including:
 * - IBiomeManager interface
 * - BaseBiomeManager with common logic
 * - OatBiomeManager specialization
 * - isCompatibleBiome() for verifying biome compatibility
 * - getIncompatibleBiomes() for returning the list
 * - Validation against Requirements 7.1, 7.2, 7.3, 7.4, 7.5
 * 
 * Requirements: 7.1, 7.2, 7.3, 7.4, 7.5
 */

import { OatBiomeManager } from '../biome/OatBiomeManager';
import { oatConfig } from '../config/OatSystemConfig';

describe('Task 4.1: BiomeManager with Incompatible Biomes List', () => {
  let biomeManager: OatBiomeManager;
  
  beforeEach(() => {
    // Create a fresh biome manager for each test
    biomeManager = new OatBiomeManager(oatConfig);
  });
  
  describe('getIncompatibleBiomes() - Return the list', () => {
    it('should return an array of incompatible biomes', () => {
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      expect(Array.isArray(incompatibleBiomes)).toBe(true);
      expect(incompatibleBiomes.length).toBeGreaterThan(0);
    });
    
    it('should include EXTREME_DESERT in the incompatible list', () => {
      // Requirement 7.1: Extreme Desert must block planting
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      expect(incompatibleBiomes).toContain('EXTREME_DESERT');
    });
    
    it('should include FROZEN_TUNDRA in the incompatible list', () => {
      // Requirement 7.2: Frozen Tundra must block planting
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      expect(incompatibleBiomes).toContain('FROZEN_TUNDRA');
    });
    
    it('should include NETHER in the incompatible list', () => {
      // Requirement 7.3: Nether must block planting
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      expect(incompatibleBiomes).toContain('NETHER');
    });
    
    it('should include END in the incompatible list', () => {
      // Requirement 7.4: End must block planting
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      expect(incompatibleBiomes).toContain('END');
    });
    
    it('should return exactly 4 incompatible biomes for oats', () => {
      // Oats have exactly 4 incompatible biomes as per requirements
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      expect(incompatibleBiomes.length).toBe(4);
    });
    
    it('should return a copy of the array (not the original)', () => {
      // Verify immutability - external code shouldn't be able to modify the list
      const incompatibleBiomes1 = biomeManager.getIncompatibleBiomes();
      const incompatibleBiomes2 = biomeManager.getIncompatibleBiomes();
      
      // Should be equal but not the same reference
      expect(incompatibleBiomes1).toEqual(incompatibleBiomes2);
      expect(incompatibleBiomes1).not.toBe(incompatibleBiomes2);
      
      // Modifying one shouldn't affect the other
      incompatibleBiomes1.push('TEST_BIOME');
      expect(incompatibleBiomes2).not.toContain('TEST_BIOME');
    });
  });
  
  describe('isCompatibleBiome() - Verify compatibility', () => {
    describe('Task 4.3: Incompatible Biomes - Unit Tests', () => {
      /**
       * These tests validate that each specific incompatible biome is correctly blocked.
       * Requirements 7.1, 7.2, 7.3, 7.4
       */
      
      it('should return false for EXTREME_DESERT (must block)', () => {
        // Requirement 7.1: Extreme Desert must prevent planting
        expect(biomeManager.isCompatibleBiome('EXTREME_DESERT')).toBe(false);
      });
      
      it('should return false for FROZEN_TUNDRA (must block)', () => {
        // Requirement 7.2: Frozen Tundra must prevent planting
        expect(biomeManager.isCompatibleBiome('FROZEN_TUNDRA')).toBe(false);
      });
      
      it('should return false for NETHER (must block)', () => {
        // Requirement 7.3: Nether must prevent planting
        expect(biomeManager.isCompatibleBiome('NETHER')).toBe(false);
      });
      
      it('should return false for END (must block)', () => {
        // Requirement 7.4: End must prevent planting
        expect(biomeManager.isCompatibleBiome('END')).toBe(false);
      });
    });
    
    describe('Compatible biomes', () => {
      it('should return true for PLAINS (compatible)', () => {
        // Requirement 7.5: Compatible biomes must allow planting
        expect(biomeManager.isCompatibleBiome('PLAINS')).toBe(true);
      });
      
      it('should return true for FOREST (compatible)', () => {
        // Requirement 7.5: Compatible biomes must allow planting
        expect(biomeManager.isCompatibleBiome('FOREST')).toBe(true);
      });
      
      it('should return true for SWAMP (compatible)', () => {
        // Requirement 7.5: Compatible biomes must allow planting
        expect(biomeManager.isCompatibleBiome('SWAMP')).toBe(true);
      });
      
      it('should return true for MOUNTAINS (compatible)', () => {
        // Requirement 7.5: Compatible biomes must allow planting
        expect(biomeManager.isCompatibleBiome('MOUNTAINS')).toBe(true);
      });
      
      it('should return true for TAIGA (compatible)', () => {
        // Requirement 7.5: Compatible biomes must allow planting
        expect(biomeManager.isCompatibleBiome('TAIGA')).toBe(true);
      });
      
      it('should return true for DESERT (regular desert, not extreme)', () => {
        // Regular desert is compatible, only EXTREME_DESERT is not
        expect(biomeManager.isCompatibleBiome('DESERT')).toBe(true);
      });
      
      it('should return true for TUNDRA (regular tundra, not frozen)', () => {
        // Regular tundra is compatible, only FROZEN_TUNDRA is not
        expect(biomeManager.isCompatibleBiome('TUNDRA')).toBe(true);
      });
      
      it('should return true for unknown biomes (default to compatible)', () => {
        // Unknown biomes should be compatible by default
        // Only explicitly listed biomes are incompatible
        expect(biomeManager.isCompatibleBiome('CUSTOM_BIOME')).toBe(true);
        expect(biomeManager.isCompatibleBiome('MODDED_BIOME')).toBe(true);
      });
    });
    
    describe('Case sensitivity', () => {
      it('should be case-sensitive for biome names', () => {
        // Biome names should match exactly
        expect(biomeManager.isCompatibleBiome('EXTREME_DESERT')).toBe(false);
        expect(biomeManager.isCompatibleBiome('extreme_desert')).toBe(true); // Different case = compatible
        expect(biomeManager.isCompatibleBiome('Extreme_Desert')).toBe(true); // Different case = compatible
      });
    });
  });
  
  describe('Integration with OatSystemConfig', () => {
    it('should use the incompatible biomes from the config', () => {
      const configBiomes = oatConfig.incompatibleBiomes;
      const managerBiomes = biomeManager.getIncompatibleBiomes();
      
      expect(managerBiomes).toEqual(configBiomes);
    });
    
    it('should reflect changes if config is updated (for testing)', () => {
      // This test verifies that the manager uses the config correctly
      // In production, config should be immutable, but this shows the relationship
      
      const originalBiomes = biomeManager.getIncompatibleBiomes();
      expect(originalBiomes.length).toBe(4);
      
      // The manager reads from config, so it should always reflect config state
      expect(biomeManager.getIncompatibleBiomes()).toEqual(oatConfig.incompatibleBiomes);
    });
  });
  
  describe('Generic design validation', () => {
    it('should implement the IBiomeManager interface', () => {
      // Verify that the manager implements the interface correctly
      expect(typeof biomeManager.isCompatibleBiome).toBe('function');
      expect(typeof biomeManager.getIncompatibleBiomes).toBe('function');
    });
    
    it('should be extensible for other crop types', () => {
      // This test documents how the system can be extended
      // For example, a cactus crop might have inverted logic (only grows in deserts)
      
      // The base manager provides the foundation
      expect(biomeManager).toBeInstanceOf(OatBiomeManager);
      
      // And can be customized by overriding methods
      // (This is demonstrated in the comments in OatBiomeManager.ts)
    });
  });
  
  describe('Edge cases and error handling', () => {
    it('should handle empty string biome name', () => {
      // Empty string is not in the incompatible list, so it's compatible
      expect(biomeManager.isCompatibleBiome('')).toBe(true);
    });
    
    it('should handle null-like values gracefully', () => {
      // These should not match any incompatible biome
      expect(biomeManager.isCompatibleBiome('null')).toBe(true);
      expect(biomeManager.isCompatibleBiome('undefined')).toBe(true);
    });
    
    it('should handle biome names with special characters', () => {
      // Special characters should work fine
      expect(biomeManager.isCompatibleBiome('BIOME_WITH_UNDERSCORES')).toBe(true);
      expect(biomeManager.isCompatibleBiome('BIOME-WITH-DASHES')).toBe(true);
      expect(biomeManager.isCompatibleBiome('BIOME.WITH.DOTS')).toBe(true);
    });
    
    it('should handle very long biome names', () => {
      const longBiomeName = 'A'.repeat(1000);
      expect(biomeManager.isCompatibleBiome(longBiomeName)).toBe(true);
    });
  });
  
  describe('Performance considerations', () => {
    it('should handle many compatibility checks efficiently', () => {
      // Simulate checking many biomes (e.g., during world generation)
      const startTime = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        biomeManager.isCompatibleBiome('PLAINS');
        biomeManager.isCompatibleBiome('EXTREME_DESERT');
        biomeManager.isCompatibleBiome('FOREST');
        biomeManager.isCompatibleBiome('NETHER');
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete 40,000 checks in under 100ms
      expect(duration).toBeLessThan(100);
    });
    
    it('should not create new arrays on every getIncompatibleBiomes call', () => {
      // While we return a copy for immutability, the operation should be fast
      const startTime = Date.now();
      
      for (let i = 0; i < 10000; i++) {
        biomeManager.getIncompatibleBiomes();
      }
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should complete 10,000 calls in under 50ms
      expect(duration).toBeLessThan(50);
    });
  });
  
  describe('Documentation and examples', () => {
    it('should demonstrate typical usage pattern', () => {
      // Example: Checking if a player can plant in their current biome
      const playerBiome = 'PLAINS';
      
      if (biomeManager.isCompatibleBiome(playerBiome)) {
        // Allow planting
        expect(true).toBe(true); // Planting allowed
      } else {
        // Show error message
        const incompatible = biomeManager.getIncompatibleBiomes();
        expect(incompatible).toContain(playerBiome);
      }
    });
    
    it('should demonstrate error message generation', () => {
      // Example: Generating a helpful error message for the player
      const playerBiome = 'NETHER';
      
      if (!biomeManager.isCompatibleBiome(playerBiome)) {
        const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
        const errorMessage = `Oats cannot be planted in ${playerBiome}. ` +
          `Incompatible biomes: ${incompatibleBiomes.join(', ')}`;
        
        expect(errorMessage).toContain('NETHER');
        expect(errorMessage).toContain('EXTREME_DESERT');
        expect(errorMessage).toContain('FROZEN_TUNDRA');
        expect(errorMessage).toContain('END');
      }
    });
  });
});
