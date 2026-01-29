import { OatParticleManager } from '../particles/OatParticleManager';
import { OatCrop } from '../models/OatCrop';
import { GrowthStage } from '../types/common';
import { ParticleConfig } from '../particles/IParticleManager';

describe('Task 12.3: Particle Manager Unit Tests', () => {
  let particleManager: OatParticleManager;
  let config: ParticleConfig;
  let crop: OatCrop;

  beforeEach(() => {
    config = {
      particleCountMin: 3,
      particleCountMax: 5,
      particleIntervalMin: 0.5,
      particleIntervalMax: 2.0
    };
    particleManager = new OatParticleManager(config);
    
    crop = new OatCrop('test-crop', {
      x: 100,
      y: 64,
      z: 200,
      world: 'overworld',
      chunk: { chunkX: 6, chunkZ: 12 }
    });
  });

  describe('Particle Generation with Stage 4 + Wind', () => {
    it('should generate particles when crop is at stage 4 and wind is active', () => {
      // Requirements: 3.6, 14.1
      crop.stage = GrowthStage.MATURITY;
      const windActive = true;
      
      const shouldSpawn = particleManager.shouldSpawnParticles(crop, windActive);
      
      expect(shouldSpawn).toBe(true);
    });

    it('should spawn particles at correct position', () => {
      // Requirements: 3.6, 14.1
      crop.stage = GrowthStage.MATURITY;
      
      // Mock the particle creation to verify position
      const spawnSpy = jest.spyOn(particleManager as any, 'createParticleEffect');
      
      particleManager.spawnWindParticles(crop.position);
      
      expect(spawnSpy).toHaveBeenCalledWith(
        crop.position,
        expect.any(Number)
      );
    });

    it('should spawn correct number of particles (3-5)', () => {
      // Requirements: 14.4
      crop.stage = GrowthStage.MATURITY;
      
      const spawnSpy = jest.spyOn(particleManager as any, 'createParticleEffect');
      
      particleManager.spawnWindParticles(crop.position);
      
      const particleCount = spawnSpy.mock.calls[0][1];
      expect(particleCount).toBeGreaterThanOrEqual(3);
      expect(particleCount).toBeLessThanOrEqual(5);
    });
  });

  describe('Particle Stop when Wind Ceases', () => {
    it('should not generate particles when wind stops', () => {
      // Requirements: 14.2
      crop.stage = GrowthStage.MATURITY;
      const windActive = false;
      
      const shouldSpawn = particleManager.shouldSpawnParticles(crop, windActive);
      
      expect(shouldSpawn).toBe(false);
    });

    it('should reset particle timer when wind stops', () => {
      // Requirements: 14.2
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 1.5; // Some accumulated time
      
      // Update with no wind
      particleManager.updateParticles(crop, false, 0.1);
      
      // Timer should be reset to 0
      expect(crop.particleTimer).toBe(0);
    });

    it('should not spawn particles when conditions change from wind to no wind', () => {
      // Requirements: 14.2
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      // First update with wind - timer should accumulate
      particleManager.updateParticles(crop, true, 0.5);
      expect(crop.particleTimer).toBe(0.5);
      
      // Second update without wind - timer should reset
      particleManager.updateParticles(crop, false, 0.1);
      expect(crop.particleTimer).toBe(0);
    });
  });

  describe('Particle Generation Conditions', () => {
    it('should not generate particles for stage 1 crops even with wind', () => {
      // Requirements: 3.6, 14.1
      crop.stage = GrowthStage.GERMINATION;
      const windActive = true;
      
      const shouldSpawn = particleManager.shouldSpawnParticles(crop, windActive);
      
      expect(shouldSpawn).toBe(false);
    });

    it('should not generate particles for stage 2 crops even with wind', () => {
      // Requirements: 3.6, 14.1
      crop.stage = GrowthStage.YOUNG_SPROUT;
      const windActive = true;
      
      const shouldSpawn = particleManager.shouldSpawnParticles(crop, windActive);
      
      expect(shouldSpawn).toBe(false);
    });

    it('should not generate particles for stage 3 crops even with wind', () => {
      // Requirements: 3.6, 14.1
      crop.stage = GrowthStage.GROWTH;
      const windActive = true;
      
      const shouldSpawn = particleManager.shouldSpawnParticles(crop, windActive);
      
      expect(shouldSpawn).toBe(false);
    });

    it('should not generate particles for stage 4 crops without wind', () => {
      // Requirements: 14.2
      crop.stage = GrowthStage.MATURITY;
      const windActive = false;
      
      const shouldSpawn = particleManager.shouldSpawnParticles(crop, windActive);
      
      expect(shouldSpawn).toBe(false);
    });
  });

  describe('Particle Timer Management', () => {
    it('should accumulate timer when conditions are met', () => {
      // Requirements: 14.3
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      particleManager.updateParticles(crop, true, 0.3);
      
      expect(crop.particleTimer).toBe(0.3);
    });

    it('should spawn particles when timer exceeds interval', () => {
      // Requirements: 14.3
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      const spawnSpy = jest.spyOn(particleManager, 'spawnWindParticles');
      
      // Update with enough time to trigger spawn (max interval is 2.0)
      particleManager.updateParticles(crop, true, 2.5);
      
      expect(spawnSpy).toHaveBeenCalled();
    });

    it('should reset timer after spawning particles', () => {
      // Requirements: 14.3
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      // Update with enough time to trigger spawn
      particleManager.updateParticles(crop, true, 2.5);
      
      // Timer should be reset to 0 after spawn
      expect(crop.particleTimer).toBe(0);
    });

    it('should not spawn particles if timer has not reached interval', () => {
      // Requirements: 14.3
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      const spawnSpy = jest.spyOn(particleManager, 'spawnWindParticles');
      
      // Update with small time (less than min interval of 0.5)
      particleManager.updateParticles(crop, true, 0.1);
      
      expect(spawnSpy).not.toHaveBeenCalled();
      expect(crop.particleTimer).toBe(0.1);
    });
  });

  describe('Multiple Particle Spawn Cycles', () => {
    it('should spawn particles multiple times over extended period', () => {
      // Requirements: 14.3
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      const spawnSpy = jest.spyOn(particleManager, 'spawnWindParticles');
      
      // Simulate multiple updates over 10 seconds
      for (let i = 0; i < 100; i++) {
        particleManager.updateParticles(crop, true, 0.1);
      }
      
      // Should have spawned particles multiple times
      // (at least 5 times in 10 seconds with max interval of 2.0)
      expect(spawnSpy.mock.calls.length).toBeGreaterThanOrEqual(5);
    });

    it('should maintain correct particle count across multiple spawns', () => {
      // Requirements: 14.4
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      const spawnSpy = jest.spyOn(particleManager as any, 'createParticleEffect');
      
      // Trigger multiple spawns
      for (let i = 0; i < 5; i++) {
        particleManager.updateParticles(crop, true, 2.5);
      }
      
      // Verify all spawns had correct particle count
      spawnSpy.mock.calls.forEach(call => {
        const count = call[1];
        expect(count).toBeGreaterThanOrEqual(3);
        expect(count).toBeLessThanOrEqual(5);
      });
    });
  });

  describe('Edge Cases', () => {
    it('should handle zero delta time gracefully', () => {
      // Edge case: no time has passed
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0.5;
      
      particleManager.updateParticles(crop, true, 0);
      
      expect(crop.particleTimer).toBe(0.5); // Should remain unchanged
    });

    it('should handle very large delta time', () => {
      // Edge case: very long time between updates
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0;
      
      const spawnSpy = jest.spyOn(particleManager, 'spawnWindParticles');
      
      particleManager.updateParticles(crop, true, 100);
      
      // Should spawn particles and reset timer
      expect(spawnSpy).toHaveBeenCalled();
      expect(crop.particleTimer).toBe(0);
    });

    it('should handle rapid stage transitions', () => {
      // Edge case: crop changes stage during particle cycle
      crop.stage = GrowthStage.MATURITY;
      crop.particleTimer = 0.5;
      
      // Update with wind - timer should accumulate
      particleManager.updateParticles(crop, true, 0.3);
      expect(crop.particleTimer).toBe(0.8);
      
      // Change to earlier stage
      crop.stage = GrowthStage.GROWTH;
      
      // Update again - should reset timer because conditions not met
      particleManager.updateParticles(crop, true, 0.5);
      expect(crop.particleTimer).toBe(0);
    });
  });
});
