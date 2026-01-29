/**
 * Property-based tests for Tasks 8.2, 8.3, and 8.4: Yield Calculator Properties
 * 
 * Tests the universal properties of the yield calculator:
 * 
 * Task 8.2 - Base Yield Properties:
 * - Property 8: Grain Yield for Mature Plants
 * - Property 9: Probabilistic Distribution of Grains
 * - Property 10: Seed Yield for Mature Plants
 * - Property 11: Probabilistic Distribution of Seeds
 * 
 * Task 8.3 - Immature Plants and Fortune Properties:
 * - Property 12: Immature Plant Yield
 * - Property 14: Fortune Effect on Maximum
 * - Property 15: Guaranteed Minimum with Fortune
 * - Property 16: Fortune Doesn't Affect Seeds
 * 
 * Task 8.4 - Unit Tests for Fortune Levels:
 * - Fortune I (max 5 grains)
 * - Fortune II (max 6 grains)
 * - Fortune III (max 7 grains)
 * 
 * These tests use fast-check to verify properties hold across many random inputs.
 * 
 * Requirements: 4.1-4.5, 5.1-5.5
 */

import * as fc from 'fast-check';
import { OatYieldCalculator } from '../yield/OatYieldCalculator';
import { OatCrop } from '../models/OatCrop';
import { BlockPosition } from '../interfaces';

describe('Tasks 8.2, 8.3, 8.4: Yield Calculator Properties', () => {
  // Helper function to create a test crop at a specific stage
  function createTestCrop(stage: number): OatCrop {
    const position: BlockPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
    
    const crop = new OatCrop('test-crop', position);
    crop.stage = stage;
    return crop;
  }

  /**
   * TASK 8.2: Base Yield Properties
   */
  
  /**
   * Property 8: Grain Yield for Mature Plants
   * 
   * For any oat plant at stage 4 harvested without Fortune, the number of grains
   * generated must be between 3 and 4 inclusive.
   * 
   * Feature: hytale-oats-farming, Property 8: Grain Yield for Mature Plants
   * Validates: Requirements 4.1
   */
  describe('Property 8: Grain Yield for Mature Plants', () => {
    it('should always generate 3-4 grains for mature plants without Fortune', () => {
      fc.assert(
        fc.property(
          // Generate many random test runs
          fc.integer({ min: 0, max: 1000 }),
          () => {
            const calculator = new OatYieldCalculator();
            const crop = createTestCrop(4); // Mature stage
            
            const yield_ = calculator.calculateYield(crop, 0); // No Fortune
            
            // Property: Grains must be between 3 and 4 inclusive
            expect(yield_.grains).toBeGreaterThanOrEqual(3);
            expect(yield_.grains).toBeLessThanOrEqual(4);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Property 9: Probabilistic Distribution of Grains
   * 
   * For any set of 1000 oat plants at stage 4 harvested without Fortune,
   * approximately 80% (±5%) must generate 4 grains and approximately 20% (±5%)
   * must generate 3 grains.
   * 
   * Feature: hytale-oats-farming, Property 9: Probabilistic Distribution of Grains
   * Validates: Requirements 4.2
   */
  describe('Property 9: Probabilistic Distribution of Grains', () => {
    it('should follow 80/20 distribution for 4 vs 3 grains', () => {
      const calculator = new OatYieldCalculator();
      const sampleSize = 1000;
      let count4Grains = 0;
      let count3Grains = 0;
      
      // Generate 1000 samples
      for (let i = 0; i < sampleSize; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 0);
        
        if (yield_.grains === 4) {
          count4Grains++;
        } else if (yield_.grains === 3) {
          count3Grains++;
        }
      }
      
      const percent4Grains = (count4Grains / sampleSize) * 100;
      const percent3Grains = (count3Grains / sampleSize) * 100;
      
      // Property: 80% ±5% should be 4 grains (75-85%)
      expect(percent4Grains).toBeGreaterThanOrEqual(75);
      expect(percent4Grains).toBeLessThanOrEqual(85);
      
      // Property: 20% ±5% should be 3 grains (15-25%)
      expect(percent3Grains).toBeGreaterThanOrEqual(15);
      expect(percent3Grains).toBeLessThanOrEqual(25);
    });
  });

  /**
   * Property 10: Seed Yield for Mature Plants
   * 
   * For any oat plant at stage 4 harvested, the number of seeds generated
   * must be between 1 and 2 inclusive.
   * 
   * Feature: hytale-oats-farming, Property 10: Seed Yield for Mature Plants
   * Validates: Requirements 4.3
   */
  describe('Property 10: Seed Yield for Mature Plants', () => {
    it('should always generate 1-2 seeds for mature plants', () => {
      fc.assert(
        fc.property(
          // Test with various Fortune levels to ensure seeds are unaffected
          fc.record({
            fortuneLevel: fc.integer({ min: 0, max: 3 }),
            testRun: fc.integer({ min: 0, max: 1000 })
          }),
          (testData) => {
            const calculator = new OatYieldCalculator();
            const crop = createTestCrop(4); // Mature stage
            
            const yield_ = calculator.calculateYield(crop, testData.fortuneLevel);
            
            // Property: Seeds must be between 1 and 2 inclusive
            expect(yield_.seeds).toBeGreaterThanOrEqual(1);
            expect(yield_.seeds).toBeLessThanOrEqual(2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });
  
  /**
   * Property 11: Probabilistic Distribution of Seeds
   * 
   * For any set of 1000 oat plants at stage 4 harvested, approximately 70% (±5%)
   * must generate 2 seeds and approximately 30% (±5%) must generate 1 seed.
   * 
   * Feature: hytale-oats-farming, Property 11: Probabilistic Distribution of Seeds
   * Validates: Requirements 4.4
   */
  describe('Property 11: Probabilistic Distribution of Seeds', () => {
    it('should follow 70/30 distribution for 2 vs 1 seeds', () => {
      const calculator = new OatYieldCalculator();
      const sampleSize = 1000;
      let count2Seeds = 0;
      let count1Seed = 0;
      
      // Generate 1000 samples
      for (let i = 0; i < sampleSize; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 0);
        
        if (yield_.seeds === 2) {
          count2Seeds++;
        } else if (yield_.seeds === 1) {
          count1Seed++;
        }
      }
      
      const percent2Seeds = (count2Seeds / sampleSize) * 100;
      const percent1Seed = (count1Seed / sampleSize) * 100;
      
      // Property: 70% ±5% should be 2 seeds (65-75%)
      expect(percent2Seeds).toBeGreaterThanOrEqual(65);
      expect(percent2Seeds).toBeLessThanOrEqual(75);
      
      // Property: 30% ±5% should be 1 seed (25-35%)
      expect(percent1Seed).toBeGreaterThanOrEqual(25);
      expect(percent1Seed).toBeLessThanOrEqual(35);
    });
  });

  /**
   * TASK 8.3: Immature Plants and Fortune Properties
   */
  
  /**
   * Property 12: Immature Plant Yield
   * 
   * For any oat plant at stages 1, 2, or 3 harvested, the yield must be
   * exactly 0 grains and 1 seed.
   * 
   * Feature: hytale-oats-farming, Property 12: Immature Plant Yield
   * Validates: Requirements 4.5
   */
  describe('Property 12: Immature Plant Yield', () => {
    it('should always generate 0 grains and 1 seed for immature plants', () => {
      fc.assert(
        fc.property(
          // Generate random immature stages (1-3) and Fortune levels
          fc.record({
            stage: fc.integer({ min: 1, max: 3 }),
            fortuneLevel: fc.integer({ min: 0, max: 3 })
          }),
          (testData) => {
            const calculator = new OatYieldCalculator();
            const crop = createTestCrop(testData.stage);
            
            const yield_ = calculator.calculateYield(crop, testData.fortuneLevel);
            
            // Property: Immature plants always give 0 grains and 1 seed
            expect(yield_.grains).toBe(0);
            expect(yield_.seeds).toBe(1);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should give same yield for all immature stages', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 0, max: 3 }), // Fortune level
          (fortuneLevel) => {
            const calculator = new OatYieldCalculator();
            
            // Test all immature stages
            const yields = [1, 2, 3].map(stage => {
              const crop = createTestCrop(stage);
              return calculator.calculateYield(crop, fortuneLevel);
            });
            
            // Property: All immature stages should give identical yields
            yields.forEach(yield_ => {
              expect(yield_.grains).toBe(0);
              expect(yield_.seeds).toBe(1);
            });
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 14: Fortune Effect on Maximum
   * 
   * For any oat plant at stage 4 harvested with Fortune level N (1-3),
   * the maximum number of grains possible must be 4 + N
   * (Fortune I: 5, Fortune II: 6, Fortune III: 7).
   * 
   * Feature: hytale-oats-farming, Property 14: Fortune Effect on Maximum
   * Validates: Requirements 5.1, 5.2, 5.3
   */
  describe('Property 14: Fortune Effect on Maximum', () => {
    it('should increase maximum grains by Fortune level', () => {
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 3 }), // Fortune I, II, or III
          (fortuneLevel) => {
            const calculator = new OatYieldCalculator();
            const expectedMax = 4 + fortuneLevel;
            
            // Sample many times to find the maximum
            const samples = 1000;
            let maxObserved = 0;
            
            for (let i = 0; i < samples; i++) {
              const crop = createTestCrop(4);
              const yield_ = calculator.calculateYield(crop, fortuneLevel);
              maxObserved = Math.max(maxObserved, yield_.grains);
            }
            
            // Property: Maximum observed should match expected maximum
            // With 1000 samples, we should see the maximum value
            expect(maxObserved).toBe(expectedMax);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should never exceed Fortune-adjusted maximum', () => {
      fc.assert(
        fc.property(
          fc.record({
            fortuneLevel: fc.integer({ min: 1, max: 3 }),
            testRun: fc.integer({ min: 0, max: 1000 })
          }),
          (testData) => {
            const calculator = new OatYieldCalculator();
            const crop = createTestCrop(4);
            const expectedMax = 4 + testData.fortuneLevel;
            
            const yield_ = calculator.calculateYield(crop, testData.fortuneLevel);
            
            // Property: Grains must not exceed 4 + Fortune level
            expect(yield_.grains).toBeLessThanOrEqual(expectedMax);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * Property 15: Guaranteed Minimum with Fortune
   * 
   * For any oat plant at stage 4 harvested with Fortune (level 1-3),
   * the number of grains generated must be at minimum 4.
   * 
   * Feature: hytale-oats-farming, Property 15: Guaranteed Minimum with Fortune
   * Validates: Requirements 5.4
   */
  describe('Property 15: Guaranteed Minimum with Fortune', () => {
    it('should guarantee minimum of 4 grains with any Fortune level', () => {
      fc.assert(
        fc.property(
          fc.record({
            fortuneLevel: fc.integer({ min: 1, max: 3 }),
            testRun: fc.integer({ min: 0, max: 1000 })
          }),
          (testData) => {
            const calculator = new OatYieldCalculator();
            const crop = createTestCrop(4);
            
            const yield_ = calculator.calculateYield(crop, testData.fortuneLevel);
            
            // Property: With Fortune, grains must be at least 4
            expect(yield_.grains).toBeGreaterThanOrEqual(4);
          }
        ),
        { numRuns: 100 }
      );
    });
    
    it('should never generate 3 grains with Fortune', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      
      // Test all Fortune levels
      for (let fortuneLevel = 1; fortuneLevel <= 3; fortuneLevel++) {
        for (let i = 0; i < samples; i++) {
          const crop = createTestCrop(4);
          const yield_ = calculator.calculateYield(crop, fortuneLevel);
          
          // Property: Should never get 3 grains with Fortune
          expect(yield_.grains).not.toBe(3);
        }
      }
    });
  });
  
  /**
   * Property 16: Fortune Doesn't Affect Seeds
   * 
   * For any oat plant at stage 4 harvested, the number of seeds generated
   * must be identical with or without Fortune (always between 1 and 2).
   * 
   * Feature: hytale-oats-farming, Property 16: Fortune Doesn't Affect Seeds
   * Validates: Requirements 5.5
   */
  describe('Property 16: Fortune Doesn\'t Affect Seeds', () => {
    it('should generate same seed distribution with and without Fortune', () => {
      const calculator = new OatYieldCalculator();
      const sampleSize = 1000;
      
      // Collect seed counts without Fortune
      const seedsWithoutFortune: number[] = [];
      for (let i = 0; i < sampleSize; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 0);
        seedsWithoutFortune.push(yield_.seeds);
      }
      
      // Collect seed counts with Fortune III (maximum)
      const seedsWithFortune: number[] = [];
      for (let i = 0; i < sampleSize; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 3);
        seedsWithFortune.push(yield_.seeds);
      }
      
      // Calculate distributions
      const count2SeedsNoFortune = seedsWithoutFortune.filter(s => s === 2).length;
      const count2SeedsWithFortune = seedsWithFortune.filter(s => s === 2).length;
      
      const percentNoFortune = (count2SeedsNoFortune / sampleSize) * 100;
      const percentWithFortune = (count2SeedsWithFortune / sampleSize) * 100;
      
      // Property: Distributions should be similar (within 10% of each other)
      expect(Math.abs(percentNoFortune - percentWithFortune)).toBeLessThan(10);
    });
    
    it('should always keep seeds in range 1-2 regardless of Fortune', () => {
      fc.assert(
        fc.property(
          fc.record({
            fortuneLevel: fc.integer({ min: 0, max: 3 }),
            testRun: fc.integer({ min: 0, max: 1000 })
          }),
          (testData) => {
            const calculator = new OatYieldCalculator();
            const crop = createTestCrop(4);
            
            const yield_ = calculator.calculateYield(crop, testData.fortuneLevel);
            
            // Property: Seeds always 1-2, regardless of Fortune
            expect(yield_.seeds).toBeGreaterThanOrEqual(1);
            expect(yield_.seeds).toBeLessThanOrEqual(2);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  /**
   * TASK 8.4: Unit Tests for Fortune Levels
   */
  
  /**
   * Unit Test: Fortune I (max 5 grains)
   * 
   * Validates: Requirements 5.1
   */
  describe('Fortune I: Maximum 5 Grains', () => {
    it('should have maximum of 5 grains with Fortune I', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      let maxObserved = 0;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 1); // Fortune I
        maxObserved = Math.max(maxObserved, yield_.grains);
      }
      
      // Should observe maximum of 5 grains
      expect(maxObserved).toBe(5);
    });
    
    it('should have minimum of 4 grains with Fortune I', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      let minObserved = Infinity;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 1); // Fortune I
        minObserved = Math.min(minObserved, yield_.grains);
      }
      
      // Should observe minimum of 4 grains
      expect(minObserved).toBe(4);
    });
    
    it('should generate grains in range [4, 5] with Fortune I', () => {
      const calculator = new OatYieldCalculator();
      const samples = 100;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 1); // Fortune I
        
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
        expect(yield_.grains).toBeLessThanOrEqual(5);
      }
    });
  });
  
  /**
   * Unit Test: Fortune II (max 6 grains)
   * 
   * Validates: Requirements 5.2
   */
  describe('Fortune II: Maximum 6 Grains', () => {
    it('should have maximum of 6 grains with Fortune II', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      let maxObserved = 0;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 2); // Fortune II
        maxObserved = Math.max(maxObserved, yield_.grains);
      }
      
      // Should observe maximum of 6 grains
      expect(maxObserved).toBe(6);
    });
    
    it('should have minimum of 4 grains with Fortune II', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      let minObserved = Infinity;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 2); // Fortune II
        minObserved = Math.min(minObserved, yield_.grains);
      }
      
      // Should observe minimum of 4 grains
      expect(minObserved).toBe(4);
    });
    
    it('should generate grains in range [4, 6] with Fortune II', () => {
      const calculator = new OatYieldCalculator();
      const samples = 100;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 2); // Fortune II
        
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
        expect(yield_.grains).toBeLessThanOrEqual(6);
      }
    });
  });
  
  /**
   * Unit Test: Fortune III (max 7 grains)
   * 
   * Validates: Requirements 5.3
   */
  describe('Fortune III: Maximum 7 Grains', () => {
    it('should have maximum of 7 grains with Fortune III', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      let maxObserved = 0;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 3); // Fortune III
        maxObserved = Math.max(maxObserved, yield_.grains);
      }
      
      // Should observe maximum of 7 grains
      expect(maxObserved).toBe(7);
    });
    
    it('should have minimum of 4 grains with Fortune III', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      let minObserved = Infinity;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 3); // Fortune III
        minObserved = Math.min(minObserved, yield_.grains);
      }
      
      // Should observe minimum of 4 grains
      expect(minObserved).toBe(4);
    });
    
    it('should generate grains in range [4, 7] with Fortune III', () => {
      const calculator = new OatYieldCalculator();
      const samples = 100;
      
      for (let i = 0; i < samples; i++) {
        const crop = createTestCrop(4);
        const yield_ = calculator.calculateYield(crop, 3); // Fortune III
        
        expect(yield_.grains).toBeGreaterThanOrEqual(4);
        expect(yield_.grains).toBeLessThanOrEqual(7);
      }
    });
  });
  
  /**
   * Comparative Test: Fortune Levels Progression
   * 
   * Validates that each Fortune level increases the maximum by exactly 1.
   */
  describe('Fortune Levels Progression', () => {
    it('should increase maximum by 1 for each Fortune level', () => {
      const calculator = new OatYieldCalculator();
      const samples = 1000;
      
      const maxByLevel: { [key: number]: number } = {};
      
      // Test Fortune 0, I, II, III
      for (let fortuneLevel = 0; fortuneLevel <= 3; fortuneLevel++) {
        let maxObserved = 0;
        
        for (let i = 0; i < samples; i++) {
          const crop = createTestCrop(4);
          const yield_ = calculator.calculateYield(crop, fortuneLevel);
          maxObserved = Math.max(maxObserved, yield_.grains);
        }
        
        maxByLevel[fortuneLevel] = maxObserved;
      }
      
      // Verify progression: 4, 5, 6, 7
      expect(maxByLevel[0]).toBe(4);
      expect(maxByLevel[1]).toBe(5);
      expect(maxByLevel[2]).toBe(6);
      expect(maxByLevel[3]).toBe(7);
    });
  });
});
