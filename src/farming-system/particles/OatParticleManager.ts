import { BaseParticleManager } from './BaseParticleManager';
import { ParticleConfig } from './IParticleManager';
import { BlockPosition } from '../interfaces';
import { OatCrop } from '../models/OatCrop';
import { GrowthStage } from '../types/common';

/**
 * Particle manager specialized for oat crops
 * Generates golden particles when mature oats are in wind
 * 
 * Validates: Requirements 3.6, 14.1, 14.2, 14.3, 14.4
 */
export class OatParticleManager extends BaseParticleManager<OatCrop> {
  constructor(config: ParticleConfig) {
    super(config);
  }

  /**
   * Determine if particles should be spawned for an oat crop
   * Particles spawn only when:
   * 1. Crop is at stage 4 (Maturity)
   * 2. Wind is active
   * 
   * Validates: Requirements 3.6, 14.1
   */
  shouldSpawnParticles(crop: OatCrop, windActive: boolean): boolean {
    return crop.stage === GrowthStage.MATURITY && windActive;
  }

  /**
   * Spawn golden wind particles for mature oats
   * Generates 3-5 golden particles
   * 
   * Validates: Requirements 14.3, 14.4
   */
  spawnWindParticles(position: BlockPosition): void {
    const count = this.getParticleCount();
    
    // Create golden particle effects
    this.createGoldenParticles(position, count);
  }

  /**
   * Get the particle timer from an oat crop
   */
  protected getCropParticleTimer(crop: OatCrop): number {
    return crop.particleTimer;
  }

  /**
   * Set the particle timer on an oat crop
   */
  protected setCropParticleTimer(crop: OatCrop, timer: number): void {
    crop.particleTimer = timer;
  }

  /**
   * Get the position of an oat crop
   */
  protected getCropPosition(crop: OatCrop): BlockPosition {
    return crop.position;
  }

  /**
   * Create golden particle effects at a position
   * In a real game engine, this would create visual particle effects
   */
  private createGoldenParticles(position: BlockPosition, count: number): void {
    // In a real implementation, this would:
    // 1. Create particle entities with golden color (#DAA520)
    // 2. Set particle velocity (slight upward and random horizontal)
    // 3. Set particle lifetime (1-2 seconds)
    // 4. Add particle to the rendering system
    
    // For testing purposes, we just call the base implementation
    this.createParticleEffect(position, count);
  }
}
