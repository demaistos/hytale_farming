import * as fc from 'fast-check';
import { OatParticleManager } from '../particles/OatParticleManager';
import { OatCrop } from '../models/OatCrop';
import { GrowthStage } from '../types/common';
import { ParticleConfig } from '../particles/IParticleManager';

describe('Task 12.2: Particle Property Tests', () => {
  let particleManager: OatParticleManager;
  let config: ParticleConfig;

  beforeEach(() => {
    config = {
      particleCountMin: 3,
      particleCountMax: 5,
      particleIntervalMin: 0.5,
      particleIntervalMax: 2.0
    };
    particleManager = new OatParticleManager(config);
  });

  describe('Property 29: Intervalle de Particules (0.5-2.0 secondes)', () => {
    it('should generate spawn intervals between 0.5 and 2.0 seconds', () => {
      // Feature: hytale-oats-farming, Property 29: Intervalle de Particules
      // Validates: Requirements 14.3
      
      fc.assert(
        fc.property(
          fc.constant(null), // Just need to run the test multiple times
          () => {
            const interval = particleManager.getSpawnInterval();
            
            // Interval must be between 0.5 and 2.0 seconds
            expect(interval).toBeGreaterThanOrEqual(0.5);
            expect(interval).toBeLessThanOrEqual(2.0);
          }
        ),
        { numRuns: 100 } // Test 100 times to verify randomization
      );
    });

    it('should generate varied intervals across multiple calls', () => {
      // Feature: hytale-oats-farming, Property 29: Intervalle de Particules
      // Validates: Requirements 14.3
      
      const intervals = new Set<number>();
      
      for (let i = 0; i < 100; i++) {
        const interval = particleManager.getSpawnInterval();
        intervals.add(interval);
      }
      
      // With 100 samples, we should have many different intervals
      // (not all the same value)
      expect(intervals.size).toBeGreaterThan(50);
    });

    it('should respect configured min and max intervals', () => {
      // Feature: hytale-oats-farming, Property 29: Intervalle de Particules
      // Validates: Requirements 14.3
      
      fc.assert(
        fc.property(
          fc.float({ min: Math.fround(0.1), max: Math.fround(1.0), noNaN: true }), // Random min
          fc.float({ min: Math.fround(1.1), max: Math.fround(5.0), noNaN: true }), // Random max
          (min, max) => {
            const customConfig: ParticleConfig = {
              particleCountMin: 3,
              particleCountMax: 5,
              particleIntervalMin: min,
              particleIntervalMax: max
            };
            const customManager = new OatParticleManager(customConfig);
            
            const interval = customManager.getSpawnInterval();
            
            expect(interval).toBeGreaterThanOrEqual(min);
            expect(interval).toBeLessThanOrEqual(max);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Property 30: Nombre de Particules (3-5 particules)', () => {
    it('should generate particle counts between 3 and 5', () => {
      // Feature: hytale-oats-farming, Property 30: Nombre de Particules
      // Validates: Requirements 14.4
      
      fc.assert(
        fc.property(
          fc.constant(null), // Just need to run the test multiple times
          () => {
            const count = particleManager.getParticleCount();
            
            // Count must be between 3 and 5 (inclusive)
            expect(count).toBeGreaterThanOrEqual(3);
            expect(count).toBeLessThanOrEqual(5);
            
            // Count must be an integer
            expect(Number.isInteger(count)).toBe(true);
          }
        ),
        { numRuns: 100 } // Test 100 times to verify randomization
      );
    });

    it('should generate all possible counts (3, 4, 5) over many samples', () => {
      // Feature: hytale-oats-farming, Property 30: Nombre de Particules
      // Validates: Requirements 14.4
      
      const counts = new Set<number>();
      
      for (let i = 0; i < 100; i++) {
        const count = particleManager.getParticleCount();
        counts.add(count);
      }
      
      // With 100 samples, we should see all three possible values
      expect(counts.has(3)).toBe(true);
      expect(counts.has(4)).toBe(true);
      expect(counts.has(5)).toBe(true);
      
      // Should not have any values outside the range
      expect(counts.size).toBe(3);
    });

    it('should respect configured min and max particle counts', () => {
      // Feature: hytale-oats-farming, Property 30: Nombre de Particules
      // Validates: Requirements 14.4
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 10 }), // Random min
          fc.integer({ min: 11, max: 20 }), // Random max
          (min, max) => {
            const customConfig: ParticleConfig = {
              particleCountMin: min,
              particleCountMax: max,
              particleIntervalMin: 0.5,
              particleIntervalMax: 2.0
            };
            const customManager = new OatParticleManager(customConfig);
            
            const count = customManager.getParticleCount();
            
            expect(count).toBeGreaterThanOrEqual(min);
            expect(count).toBeLessThanOrEqual(max);
            expect(Number.isInteger(count)).toBe(true);
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Combined Particle Properties', () => {
    it('should maintain correct ranges when spawning particles multiple times', () => {
      // Feature: hytale-oats-farming, Property 29 & 30
      // Validates: Requirements 14.3, 14.4
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 100 }), // Number of spawn events
          (numSpawns) => {
            for (let i = 0; i < numSpawns; i++) {
              const count = particleManager.getParticleCount();
              const interval = particleManager.getSpawnInterval();
              
              // Verify both properties hold
              expect(count).toBeGreaterThanOrEqual(3);
              expect(count).toBeLessThanOrEqual(5);
              expect(interval).toBeGreaterThanOrEqual(0.5);
              expect(interval).toBeLessThanOrEqual(2.0);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });

  describe('Particle Spawning Conditions', () => {
    it('should only spawn particles for mature crops with wind', () => {
      // Feature: hytale-oats-farming, Property 29 & 30
      // Validates: Requirements 3.6, 14.1, 14.2
      
      fc.assert(
        fc.property(
          fc.integer({ min: 1, max: 4 }), // Random growth stage
          fc.boolean(), // Random wind state
          (stage, windActive) => {
            const crop = new OatCrop('test-crop', {
              x: 0,
              y: 64,
              z: 0,
              world: 'overworld',
              chunk: { chunkX: 0, chunkZ: 0 }
            });
            crop.stage = stage;
            
            const shouldSpawn = particleManager.shouldSpawnParticles(crop, windActive);
            
            // Particles should only spawn when stage is 4 AND wind is active
            if (stage === GrowthStage.MATURITY && windActive) {
              expect(shouldSpawn).toBe(true);
            } else {
              expect(shouldSpawn).toBe(false);
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
