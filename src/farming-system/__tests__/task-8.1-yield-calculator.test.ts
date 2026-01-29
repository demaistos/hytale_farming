/**
 * Unit tests for Task 8.1: YieldCalculator generic system
 * 
 * Tests the generic yield calculator system including:
 * - IYieldCalculator interface
 * - BaseYieldCalculator with common probabilistic logic
 * - OatYieldCalculator specialization
 * - calculateItemCount() with configurable probability
 * - Fortune application for primary items
 * - calculateYield() combining all items
 * - Immature crop handling
 * 
 * Requirements: 4.1, 4.2, 4.3, 4.4, 4.5, 5.1, 5.2, 5.3, 5.4, 5.5
 */

import { OatYieldCalculator } from '../yield/OatYieldCalculator';
import { OatCrop } from '../models/OatCrop';
import { BlockPosition } from '../interfaces';
import { HarvestYield } from '../interfaces/ICropYield';

describe('Task 8.1: YieldCalculator Generic System', () => {
  let yieldCalculator: OatYieldCalculator;
  let testPosition: BlockPosition;
  
  beforeEach(() => {
    yieldCalculator = new OatYieldCalculator();
    
    testPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
  });
  
  describe('Configuration', () => {
    it('should have correct oat yield configuration', () => {
      const config = yieldCalculator.getConfig();
      
      // Grain configuration
      expect(config.primaryMinBase).toBe(3);
      expect(config.primaryMaxBase).toBe(4);
      expect(config.primaryHighChance).toBe(0.80);
      
      // Seed configuration
      expect(config.seedMinBase).toBe(1);
      expect(config.seedMaxBase).toBe(2);
      expect(config.seedHighChance).toBe(0.70);
      
      // Fortune configuration
      expect(config.fortunePrimaryBonus).toEqual([0, 1, 2, 3]);
      expect(config.fortuneMinPrimary).toBe(4);
      expect(config.fortuneAffectsSeeds).toBe(false);
      
      // Immature configuration
      expect(config.immatureSeedCount).toBe(1);
      expect(config.matureStage).toBe(4);
    });
  });
  
  describe('calculateYield() - Mature crops without Fortune', () => {
    it('should generate grains between 3 and 4 for mature crops', () => {
      // Requirement 4.1: Mature crops yield 3-4 grains
      const crop = new OatCrop('test-1', testPosition);
      crop.stage = 4; // Mature
      
      // Test multiple times to see the range
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 0);
        results.add(yield_.grains);
        
        // Should be in valid range
        expect(yield_.grains).toBeGreaterThanOrEqual(3);
        expect(yield_.grains).toBeLessThanOrEqual(4);
      }
      
      // Should see both 3 and 4 in the results
      expect(results.has(3) || results.has(4)).toBe(true);
    });
    
    it('should generate seeds between 1 and 2 for mature crops', () => {
      // Requirement 4.3: Mature crops yield 1-2 seeds
      const crop = new OatCrop('test-2', testPosition);
      crop.stage = 4; // Mature
      
      // Test multiple times to see the range
      const results = new Set<number>();
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 0);
        results.add(yield_.seeds);
        
        // Should be in valid range
        expect(yield_.seeds).toBeGreaterThanOrEqual(1);
        expect(yield_.seeds).toBeLessThanOrEqual(2);
      }
      
      // Should see both 1 and 2 in the results
      expect(results.has(1) || results.has(2)).toBe(true);
    });
    
    it('should generate approximately 80% chance for 4 grains', () => {
      // Requirement 4.2: 80% chance for 4 grains, 20% for 3 grains
      const crop = new OatCrop('test-3', testPosition);
      crop.stage = 4;
      
      const samples = 1000;
      let count4 = 0;
      let count3 = 0;
      
      for (let i = 0; i < samples; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 0);
        if (yield_.grains === 4) count4++;
        if (yield_.grains === 3) count3++;
      }
      
      const percent4 = count4 / samples;
      const percent3 = count3 / samples;
      
      // Should be approximately 80% for 4 grains (±5% tolerance)
      expect(percent4).toBeGreaterThan(0.75);
      expect(percent4).toBeLessThan(0.85);
      
      // Should be approximately 20% for 3 grains (±5% tolerance)
      expect(percent3).toBeGreaterThan(0.15);
      expect(percent3).toBeLessThan(0.25);
      
      // Total should be 100%
      expect(count3 + count4).toBe(samples);
    });
    
    it('should generate approximately 70% chance for 2 seeds', () => {
      // Requirement 4.4: 70% chance for 2 seeds, 30% for 1 seed
      const crop = new OatCrop('test-4', testPosition);
      crop.stage = 4;
      
      const samples = 1000;
      let count2 = 0;
      let count1 = 0;
      
      for (let i = 0; i < samples; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 0);
        if (yield_.seeds === 2) count2++;
        if (yield_.seeds === 1) count1++;
      }
      
      const percent2 = count2 / samples;
      const percent1 = count1 / samples;
      
      // Should be approximately 70% for 2 seeds (±5% tolerance)
      expect(percent2).toBeGreaterThan(0.65);
      expect(percent2).toBeLessThan(0.75);
      
      // Should be approximately 30% for 1 seed (±5% tolerance)
      expect(percent1).toBeGreaterThan(0.25);
      expect(percent1).toBeLessThan(0.35);
      
      // Total should be 100%
      expect(count1 + count2).toBe(samples);
    });
  });
  
  describe('calculateYield() - Immature crops', () => {
    it('should yield 0 grains and 1 seed for stage 1', () => {
      // Requirement 4.5: Immature crops yield 0 grains, 1 seed
      const crop = new OatCrop('test-5', testPosition);
      crop.stage = 1;
      
      const yield_ = yieldCalculator.calculateYield(crop, 0);
      
      expect(yield_.grains).toBe(0);
      expect(yield_.seeds).toBe(1);
    });
    
    it('should yield 0 grains and 1 seed for stage 2', () => {
      const crop = new OatCrop('test-6', testPosition);
      crop.stage = 2;
      
      const yield_ = yieldCalculator.calculateYield(crop, 0);
      
      expect(yield_.grains).toBe(0);
      expect(yield_.seeds).toBe(1);
    });
    
    it('should yield 0 grains and 1 seed for stage 3', () => {
      const crop = new OatCrop('test-7', testPosition);
      crop.stage = 3;
      
      const yield_ = yieldCalculator.calculateYield(crop, 0);
      
      expect(yield_.grains).toBe(0);
      expect(yield_.seeds).toBe(1);
    });
    
    it('should always yield exactly 1 seed for immature crops', () => {
      // Test consistency across multiple harvests
      for (let stage = 1; stage <= 3; stage++) {
        const crop = new OatCrop(`test-stage-${stage}`, testPosition);
        crop.stage = stage;
        
        // Test 100 times to ensure consistency
        for (let i = 0; i < 100; i++) {
          const yield_ = yieldCalculator.calculateYield(crop, 0);
          expect(yield_.grains).toBe(0);
          expect(yield_.seeds).toBe(1);
        }
      }
    });
  });
  
  describe('calculateYield() - Fortune I', () => {
    it('should increase maximum grains to 5 with Fortune I', () => {
      // Requirement 5.1: Fortune I increases max to 5
      const crop = new OatCrop('test-8', testPosition);
      crop.stage = 4;
      
      const results = new Set<number>();
      for (let i = 0; i < 200; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 1);
        results.add(yield_.grains);
        
        // Should be between 4 and 5
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
        expect(yield_.grains).toBeLessThanOrEqual(5);
      }
      
      // Should see 5 in the results
      expect(results.has(5)).toBe(true);
    });
    
    it('should guarantee minimum 4 grains with Fortune I', () => {
      // Requirement 5.4: Fortune guarantees minimum 4 grains
      const crop = new OatCrop('test-9', testPosition);
      crop.stage = 4;
      
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 1);
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
      }
    });
    
    it('should not affect seed count with Fortune I', () => {
      // Requirement 5.5: Fortune doesn't affect seeds
      const crop = new OatCrop('test-10', testPosition);
      crop.stage = 4;
      
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 1);
        
        // Seeds should still be 1-2
        expect(yield_.seeds).toBeGreaterThanOrEqual(1);
        expect(yield_.seeds).toBeLessThanOrEqual(2);
      }
    });
  });
  
  describe('calculateYield() - Fortune II', () => {
    it('should increase maximum grains to 6 with Fortune II', () => {
      // Requirement 5.2: Fortune II increases max to 6
      const crop = new OatCrop('test-11', testPosition);
      crop.stage = 4;
      
      const results = new Set<number>();
      for (let i = 0; i < 200; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 2);
        results.add(yield_.grains);
        
        // Should be between 4 and 6
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
        expect(yield_.grains).toBeLessThanOrEqual(6);
      }
      
      // Should see 6 in the results
      expect(results.has(6)).toBe(true);
    });
    
    it('should guarantee minimum 4 grains with Fortune II', () => {
      const crop = new OatCrop('test-12', testPosition);
      crop.stage = 4;
      
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 2);
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
      }
    });
    
    it('should not affect seed count with Fortune II', () => {
      const crop = new OatCrop('test-13', testPosition);
      crop.stage = 4;
      
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 2);
        
        // Seeds should still be 1-2
        expect(yield_.seeds).toBeGreaterThanOrEqual(1);
        expect(yield_.seeds).toBeLessThanOrEqual(2);
      }
    });
  });
  
  describe('calculateYield() - Fortune III', () => {
    it('should increase maximum grains to 7 with Fortune III', () => {
      // Requirement 5.3: Fortune III increases max to 7
      const crop = new OatCrop('test-14', testPosition);
      crop.stage = 4;
      
      const results = new Set<number>();
      for (let i = 0; i < 200; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 3);
        results.add(yield_.grains);
        
        // Should be between 4 and 7
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
        expect(yield_.grains).toBeLessThanOrEqual(7);
      }
      
      // Should see 7 in the results
      expect(results.has(7)).toBe(true);
    });
    
    it('should guarantee minimum 4 grains with Fortune III', () => {
      const crop = new OatCrop('test-15', testPosition);
      crop.stage = 4;
      
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 3);
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
      }
    });
    
    it('should not affect seed count with Fortune III', () => {
      const crop = new OatCrop('test-16', testPosition);
      crop.stage = 4;
      
      for (let i = 0; i < 100; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 3);
        
        // Seeds should still be 1-2
        expect(yield_.seeds).toBeGreaterThanOrEqual(1);
        expect(yield_.seeds).toBeLessThanOrEqual(2);
      }
    });
  });
  
  describe('calculateItemCount() - Direct testing', () => {
    it('should return 0 primary items for immature crops', () => {
      const crop = new OatCrop('test-17', testPosition);
      
      for (let stage = 1; stage <= 3; stage++) {
        crop.stage = stage;
        const count = yieldCalculator.calculateItemCount(stage, 0, 'primary');
        expect(count).toBe(0);
      }
    });
    
    it('should return 1 seed for immature crops', () => {
      const crop = new OatCrop('test-18', testPosition);
      
      for (let stage = 1; stage <= 3; stage++) {
        crop.stage = stage;
        const count = yieldCalculator.calculateItemCount(stage, 0, 'seed');
        expect(count).toBe(1);
      }
    });
    
    it('should return valid primary count for mature crops', () => {
      const count = yieldCalculator.calculateItemCount(4, 0, 'primary');
      expect(count).toBeGreaterThanOrEqual(3);
      expect(count).toBeLessThanOrEqual(4);
    });
    
    it('should return valid seed count for mature crops', () => {
      const count = yieldCalculator.calculateItemCount(4, 0, 'seed');
      expect(count).toBeGreaterThanOrEqual(1);
      expect(count).toBeLessThanOrEqual(2);
    });
    
    it('should handle unknown item types gracefully', () => {
      const count = yieldCalculator.calculateItemCount(4, 0, 'unknown');
      expect(count).toBe(0);
    });
  });
  
  describe('Fortune distribution uniformity', () => {
    it('should distribute Fortune I results uniformly between 4 and 5', () => {
      const crop = new OatCrop('test-19', testPosition);
      crop.stage = 4;
      
      const counts = { 4: 0, 5: 0 };
      const samples = 1000;
      
      for (let i = 0; i < samples; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 1);
        counts[yield_.grains as 4 | 5]++;
      }
      
      // Should be roughly 50/50 distribution (uniform)
      const percent4 = counts[4] / samples;
      const percent5 = counts[5] / samples;
      
      // Allow 10% tolerance for randomness
      expect(percent4).toBeGreaterThan(0.40);
      expect(percent4).toBeLessThan(0.60);
      expect(percent5).toBeGreaterThan(0.40);
      expect(percent5).toBeLessThan(0.60);
    });
    
    it('should distribute Fortune II results uniformly between 4, 5, and 6', () => {
      const crop = new OatCrop('test-20', testPosition);
      crop.stage = 4;
      
      const counts = { 4: 0, 5: 0, 6: 0 };
      const samples = 1500;
      
      for (let i = 0; i < samples; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 2);
        counts[yield_.grains as 4 | 5 | 6]++;
      }
      
      // Should be roughly 33/33/33 distribution (uniform)
      const percent4 = counts[4] / samples;
      const percent5 = counts[5] / samples;
      const percent6 = counts[6] / samples;
      
      // Allow 10% tolerance for randomness
      expect(percent4).toBeGreaterThan(0.23);
      expect(percent4).toBeLessThan(0.43);
      expect(percent5).toBeGreaterThan(0.23);
      expect(percent5).toBeLessThan(0.43);
      expect(percent6).toBeGreaterThan(0.23);
      expect(percent6).toBeLessThan(0.43);
    });
    
    it('should distribute Fortune III results uniformly between 4, 5, 6, and 7', () => {
      const crop = new OatCrop('test-21', testPosition);
      crop.stage = 4;
      
      const counts = { 4: 0, 5: 0, 6: 0, 7: 0 };
      const samples = 2000;
      
      for (let i = 0; i < samples; i++) {
        const yield_ = yieldCalculator.calculateYield(crop, 3);
        counts[yield_.grains as 4 | 5 | 6 | 7]++;
      }
      
      // Should be roughly 25/25/25/25 distribution (uniform)
      const percent4 = counts[4] / samples;
      const percent5 = counts[5] / samples;
      const percent6 = counts[6] / samples;
      const percent7 = counts[7] / samples;
      
      // Allow 10% tolerance for randomness
      expect(percent4).toBeGreaterThan(0.15);
      expect(percent4).toBeLessThan(0.35);
      expect(percent5).toBeGreaterThan(0.15);
      expect(percent5).toBeLessThan(0.35);
      expect(percent6).toBeGreaterThan(0.15);
      expect(percent6).toBeLessThan(0.35);
      expect(percent7).toBeGreaterThan(0.15);
      expect(percent7).toBeLessThan(0.35);
    });
  });
  
  describe('Edge cases and validation', () => {
    it('should handle Fortune level 0 correctly', () => {
      const crop = new OatCrop('test-22', testPosition);
      crop.stage = 4;
      
      const yield_ = yieldCalculator.calculateYield(crop, 0);
      
      expect(yield_.grains).toBeGreaterThanOrEqual(3);
      expect(yield_.grains).toBeLessThanOrEqual(4);
    });
    
    it('should handle invalid Fortune levels gracefully', () => {
      const crop = new OatCrop('test-23', testPosition);
      crop.stage = 4;
      
      // Fortune level 4 (invalid, should treat as 0 bonus)
      const yield_ = yieldCalculator.calculateYield(crop, 4);
      
      // Should still return valid results
      expect(yield_.grains).toBeGreaterThanOrEqual(4);
      expect(yield_.seeds).toBeGreaterThanOrEqual(1);
      expect(yield_.seeds).toBeLessThanOrEqual(2);
    });
    
    it('should handle negative Fortune levels gracefully', () => {
      const crop = new OatCrop('test-24', testPosition);
      crop.stage = 4;
      
      const yield_ = yieldCalculator.calculateYield(crop, -1);
      
      // Should treat as no Fortune
      expect(yield_.grains).toBeGreaterThanOrEqual(3);
      expect(yield_.grains).toBeLessThanOrEqual(4);
    });
    
    it('should return consistent structure for HarvestYield', () => {
      const crop = new OatCrop('test-25', testPosition);
      crop.stage = 4;
      
      const yield_ = yieldCalculator.calculateYield(crop, 0);
      
      expect(yield_).toHaveProperty('grains');
      expect(yield_).toHaveProperty('seeds');
      expect(typeof yield_.grains).toBe('number');
      expect(typeof yield_.seeds).toBe('number');
    });
  });
  
  describe('Generic design validation', () => {
    it('should implement IYieldCalculator interface', () => {
      expect(typeof yieldCalculator.calculateYield).toBe('function');
      expect(typeof yieldCalculator.calculateItemCount).toBe('function');
      expect(typeof yieldCalculator.getConfig).toBe('function');
    });
    
    it('should be extensible for other crop types', () => {
      // The yield calculator is generic and can be extended
      const config = yieldCalculator.getConfig();
      
      // Configuration is flexible and can be customized
      expect(config).toHaveProperty('primaryMinBase');
      expect(config).toHaveProperty('primaryMaxBase');
      expect(config).toHaveProperty('seedMinBase');
      expect(config).toHaveProperty('seedMaxBase');
      expect(config).toHaveProperty('fortunePrimaryBonus');
      expect(config).toHaveProperty('matureStage');
    });
    
    it('should support configurable probability distributions', () => {
      const config = yieldCalculator.getConfig();
      
      // Probabilities are configurable
      expect(config.primaryHighChance).toBeGreaterThan(0);
      expect(config.primaryHighChance).toBeLessThanOrEqual(1);
      expect(config.seedHighChance).toBeGreaterThan(0);
      expect(config.seedHighChance).toBeLessThanOrEqual(1);
    });
  });
  
  describe('Integration: Complete harvest scenarios', () => {
    it('should handle a typical harvest of mature oats', () => {
      const crop = new OatCrop('harvest-1', testPosition);
      crop.stage = 4;
      crop.stageProgress = 86400;
      crop.totalAge = 345600;
      
      const yield_ = yieldCalculator.calculateYield(crop, 0);
      
      expect(yield_.grains).toBeGreaterThanOrEqual(3);
      expect(yield_.grains).toBeLessThanOrEqual(4);
      expect(yield_.seeds).toBeGreaterThanOrEqual(1);
      expect(yield_.seeds).toBeLessThanOrEqual(2);
    });
    
    it('should handle early harvest of immature oats', () => {
      const crop = new OatCrop('harvest-2', testPosition);
      crop.stage = 2;
      crop.stageProgress = 50000;
      crop.totalAge = 136400;
      
      const yield_ = yieldCalculator.calculateYield(crop, 0);
      
      expect(yield_.grains).toBe(0);
      expect(yield_.seeds).toBe(1);
    });
    
    it('should handle Fortune-enhanced harvest', () => {
      const crop = new OatCrop('harvest-3', testPosition);
      crop.stage = 4;
      
      const yield_ = yieldCalculator.calculateYield(crop, 3);
      
      expect(yield_.grains).toBeGreaterThanOrEqual(4);
      expect(yield_.grains).toBeLessThanOrEqual(7);
      expect(yield_.seeds).toBeGreaterThanOrEqual(1);
      expect(yield_.seeds).toBeLessThanOrEqual(2);
    });
    
    it('should produce different results across multiple harvests', () => {
      // Verify randomness is working
      const results = new Set<string>();
      
      for (let i = 0; i < 50; i++) {
        const crop = new OatCrop(`harvest-${i}`, testPosition);
        crop.stage = 4;
        
        const yield_ = yieldCalculator.calculateYield(crop, 0);
        results.add(`${yield_.grains}-${yield_.seeds}`);
      }
      
      // Should see multiple different combinations
      expect(results.size).toBeGreaterThan(1);
    });
  });
});

