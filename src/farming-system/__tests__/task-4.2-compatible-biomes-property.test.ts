/**
 * Property-based test for Task 4.2: Compatible Biomes
 * 
 * Feature: hytale-oats-farming, Property 20: Autorisation dans Biomes Compatibles
 * 
 * Property 20: For any biome that is NOT in the incompatible biomes list 
 * (Extreme Desert, Frozen Tundra, Nether, End), oat planting must be authorized.
 * 
 * **Validates: Requirements 7.5**
 * 
 * Requirements:
 * - 7.5: When an oat seed is planted in a compatible biome, the biome manager 
 *        must authorize planting
 * 
 * This test uses fast-check to generate random biome names to verify that the
 * authorization property holds universally for all compatible biomes.
 */

import * as fc from 'fast-check';
import { OatBiomeManager } from '../biome/OatBiomeManager';
import { oatConfig } from '../config/OatSystemConfig';

describe('Task 4.2: Property-Based Test - Compatible Biomes', () => {
  describe('Property 20: Autorisation dans Biomes Compatibles', () => {
    let biomeManager: OatBiomeManager;
    
    beforeEach(() => {
      biomeManager = new OatBiomeManager(oatConfig);
    });
    
    /**
     * Property: For any biome that is NOT in the incompatible list, planting
     * must be authorized.
     * 
     * This property tests that:
     * 1. All biomes NOT in the incompatible list return true
     * 2. The authorization is consistent across all compatible biomes
     * 3. The system correctly distinguishes between compatible and incompatible biomes
     */
    it('should authorize planting in all compatible biomes (Property 20)', () => {
      // Get the list of incompatible biomes
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      // Arbitrary for generating random biome names that are NOT incompatible
      // We generate a variety of realistic and custom biome names
      const arbCompatibleBiome = fc.oneof(
        // Common Hytale/Minecraft-style biomes (compatible)
        fc.constant('PLAINS'),
        fc.constant('FOREST'),
        fc.constant('SWAMP'),
        fc.constant('MOUNTAINS'),
        fc.constant('TAIGA'),
        fc.constant('JUNGLE'),
        fc.constant('SAVANNA'),
        fc.constant('OCEAN'),
        fc.constant('RIVER'),
        fc.constant('BEACH'),
        fc.constant('HILLS'),
        fc.constant('BIRCH_FOREST'),
        fc.constant('DARK_FOREST'),
        fc.constant('MUSHROOM_ISLAND'),
        fc.constant('ICE_PLAINS'),
        fc.constant('MESA'),
        fc.constant('BADLANDS'),
        
        // Regular versions of extreme biomes (compatible)
        fc.constant('DESERT'),        // Regular desert (not EXTREME_DESERT)
        fc.constant('TUNDRA'),        // Regular tundra (not FROZEN_TUNDRA)
        
        // Custom/modded biomes (should be compatible by default)
        fc.constant('CUSTOM_BIOME'),
        fc.constant('MODDED_BIOME'),
        fc.constant('PLAYER_CREATED_BIOME'),
        fc.constant('VOLCANIC_PLAINS'),
        fc.constant('CRYSTAL_FOREST'),
        fc.constant('FLOATING_ISLANDS'),
        
        // Random alphanumeric biome names
        fc.string({ minLength: 3, maxLength: 30 })
          .filter(s => !incompatibleBiomes.includes(s))
          .map(s => s.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))
      ).filter(biome => !incompatibleBiomes.includes(biome));
      
      // Property: For any compatible biome, isCompatibleBiome must return true
      fc.assert(
        fc.property(
          arbCompatibleBiome,
          (biome: string) => {
            // Pre-condition: Verify the biome is NOT in the incompatible list
            expect(incompatibleBiomes).not.toContain(biome);
            
            // Act: Check if the biome is compatible
            const isCompatible = biomeManager.isCompatibleBiome(biome);
            
            // Assert: Must be compatible (return true)
            expect(isCompatible).toBe(true);
          }
        ),
        { numRuns: 100 } // Run 100 iterations as specified in requirements
      );
    });
    
    /**
     * Property: The authorization must be consistent - calling isCompatibleBiome
     * multiple times with the same biome must always return the same result.
     * 
     * This tests the deterministic nature of the biome validation.
     */
    it('should return consistent results for the same compatible biome (Property 20 - consistency)', () => {
      // Get the list of incompatible biomes
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      // Arbitrary for generating compatible biome names
      const arbCompatibleBiome = fc.oneof(
        fc.constant('PLAINS'),
        fc.constant('FOREST'),
        fc.constant('SWAMP'),
        fc.constant('MOUNTAINS'),
        fc.constant('TAIGA'),
        fc.constant('DESERT'),
        fc.constant('TUNDRA')
      ).filter(biome => !incompatibleBiomes.includes(biome));
      
      // Property: Multiple checks of the same biome must return the same result
      fc.assert(
        fc.property(
          arbCompatibleBiome,
          (biome: string) => {
            // Act: Check compatibility multiple times
            const result1 = biomeManager.isCompatibleBiome(biome);
            const result2 = biomeManager.isCompatibleBiome(biome);
            const result3 = biomeManager.isCompatibleBiome(biome);
            
            // Assert: All results must be identical and true
            expect(result1).toBe(true);
            expect(result2).toBe(true);
            expect(result3).toBe(true);
            expect(result1).toBe(result2);
            expect(result2).toBe(result3);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: The incompatible biomes list must be a proper subset of all
     * possible biomes - there must exist biomes that are compatible.
     * 
     * This tests that the system doesn't block ALL biomes.
     */
    it('should have at least some compatible biomes (Property 20 - non-empty compatible set)', () => {
      // Arbitrary for generating a diverse set of biome names
      const arbBiomeName = fc.oneof(
        fc.constant('PLAINS'),
        fc.constant('FOREST'),
        fc.constant('SWAMP'),
        fc.constant('MOUNTAINS'),
        fc.constant('TAIGA'),
        fc.constant('JUNGLE'),
        fc.constant('SAVANNA'),
        fc.constant('DESERT'),
        fc.constant('TUNDRA'),
        fc.constant('OCEAN')
      );
      
      // Property: At least one biome in our test set must be compatible
      fc.assert(
        fc.property(
          fc.array(arbBiomeName, { minLength: 10, maxLength: 10 }),
          (biomes: string[]) => {
            // Act: Check how many biomes are compatible
            const compatibleCount = biomes.filter(biome => 
              biomeManager.isCompatibleBiome(biome)
            ).length;
            
            // Assert: At least some biomes must be compatible
            // (We know PLAINS, FOREST, etc. are compatible)
            expect(compatibleCount).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: The complement property - if a biome is NOT incompatible,
     * it must be compatible. This is the logical inverse of the incompatibility check.
     * 
     * This tests the binary nature of biome compatibility.
     */
    it('should authorize any biome not in the incompatible list (Property 20 - complement)', () => {
      // Get the incompatible biomes
      const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
      
      // Arbitrary for generating any biome name
      const arbAnyBiome = fc.oneof(
        // Known compatible biomes
        fc.constant('PLAINS'),
        fc.constant('FOREST'),
        fc.constant('SWAMP'),
        fc.constant('MOUNTAINS'),
        fc.constant('TAIGA'),
        fc.constant('DESERT'),
        fc.constant('TUNDRA'),
        
        // Known incompatible biomes
        fc.constant('EXTREME_DESERT'),
        fc.constant('FROZEN_TUNDRA'),
        fc.constant('NETHER'),
        fc.constant('END'),
        
        // Random biomes
        fc.string({ minLength: 3, maxLength: 20 })
          .map(s => s.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))
      );
      
      // Property: isCompatibleBiome(biome) === !incompatibleBiomes.includes(biome)
      fc.assert(
        fc.property(
          arbAnyBiome,
          (biome: string) => {
            // Act: Check compatibility
            const isCompatible = biomeManager.isCompatibleBiome(biome);
            const isInIncompatibleList = incompatibleBiomes.includes(biome);
            
            // Assert: Compatible if and only if NOT in incompatible list
            expect(isCompatible).toBe(!isInIncompatibleList);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Case sensitivity - biome names must match exactly. Similar names
     * with different cases should be treated as different biomes.
     * 
     * This tests that only exact matches of incompatible biomes are blocked.
     */
    it('should be case-sensitive for biome authorization (Property 20 - case sensitivity)', () => {
      // Arbitrary for generating case variations of incompatible biomes
      // These should be COMPATIBLE because they don't match exactly
      const arbCaseVariation = fc.oneof(
        fc.constant('extreme_desert'),    // lowercase version of EXTREME_DESERT
        fc.constant('Extreme_Desert'),    // mixed case
        fc.constant('frozen_tundra'),     // lowercase version of FROZEN_TUNDRA
        fc.constant('Frozen_Tundra'),     // mixed case
        fc.constant('nether'),            // lowercase version of NETHER
        fc.constant('Nether'),            // mixed case
        fc.constant('end'),               // lowercase version of END
        fc.constant('End')                // mixed case
      );
      
      // Property: Case variations of incompatible biomes should be compatible
      fc.assert(
        fc.property(
          arbCaseVariation,
          (biome: string) => {
            // Get the incompatible biomes (all uppercase)
            const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
            
            // Pre-condition: Verify this case variation is NOT in the list
            expect(incompatibleBiomes).not.toContain(biome);
            
            // Act: Check if compatible
            const isCompatible = biomeManager.isCompatibleBiome(biome);
            
            // Assert: Must be compatible (case doesn't match exactly)
            expect(isCompatible).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Unknown/custom biomes should default to compatible.
     * This ensures the system is extensible and doesn't break with new biomes.
     * 
     * This tests the "open world" assumption - new biomes are compatible by default.
     */
    it('should authorize unknown/custom biomes by default (Property 20 - extensibility)', () => {
      // Arbitrary for generating random custom biome names
      const arbCustomBiome = fc.string({ minLength: 5, maxLength: 30 })
        .map(s => 'CUSTOM_' + s.toUpperCase().replace(/[^A-Z0-9_]/g, '_'))
        .filter(s => {
          const incompatible = biomeManager.getIncompatibleBiomes();
          return !incompatible.includes(s);
        });
      
      // Property: Custom biomes should be compatible by default
      fc.assert(
        fc.property(
          arbCustomBiome,
          (biome: string) => {
            // Act: Check if compatible
            const isCompatible = biomeManager.isCompatibleBiome(biome);
            
            // Assert: Must be compatible (not in incompatible list)
            expect(isCompatible).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Biome names with special characters should be handled correctly.
     * As long as they're not in the incompatible list, they should be compatible.
     * 
     * This tests robustness of the biome validation.
     */
    it('should handle biome names with special characters (Property 20 - special characters)', () => {
      // Arbitrary for generating biome names with special characters
      const arbSpecialBiome = fc.oneof(
        fc.constant('BIOME_WITH_UNDERSCORES'),
        fc.constant('BIOME-WITH-DASHES'),
        fc.constant('BIOME.WITH.DOTS'),
        fc.constant('BIOME WITH SPACES'),
        fc.constant('BIOME123'),
        fc.constant('123BIOME'),
        fc.constant('BIOME_123_TEST')
      );
      
      // Property: Special character biomes should be compatible (not in incompatible list)
      fc.assert(
        fc.property(
          arbSpecialBiome,
          (biome: string) => {
            // Get incompatible biomes
            const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
            
            // Pre-condition: These special biomes are not in the incompatible list
            expect(incompatibleBiomes).not.toContain(biome);
            
            // Act: Check if compatible
            const isCompatible = biomeManager.isCompatibleBiome(biome);
            
            // Assert: Must be compatible
            expect(isCompatible).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    /**
     * Property: Empty string and edge case biome names should be handled.
     * These should be compatible (not in the incompatible list).
     * 
     * This tests edge case handling.
     */
    it('should handle edge case biome names (Property 20 - edge cases)', () => {
      // Arbitrary for generating edge case biome names
      const arbEdgeCaseBiome = fc.oneof(
        fc.constant(''),                  // Empty string
        fc.constant(' '),                 // Single space
        fc.constant('A'),                 // Single character
        fc.constant('_'),                 // Single underscore
        fc.constant('null'),              // String "null"
        fc.constant('undefined'),         // String "undefined"
        fc.constant('0'),                 // String "0"
        fc.constant('false')              // String "false"
      );
      
      // Property: Edge case biomes should be compatible (not in incompatible list)
      fc.assert(
        fc.property(
          arbEdgeCaseBiome,
          (biome: string) => {
            // Get incompatible biomes
            const incompatibleBiomes = biomeManager.getIncompatibleBiomes();
            
            // Pre-condition: These edge cases are not in the incompatible list
            expect(incompatibleBiomes).not.toContain(biome);
            
            // Act: Check if compatible
            const isCompatible = biomeManager.isCompatibleBiome(biome);
            
            // Assert: Must be compatible
            expect(isCompatible).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
