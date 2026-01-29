import { IParticleManager, ParticleConfig } from './IParticleManager';
import { BlockPosition } from '../interfaces';

/**
 * Base implementation of particle manager with common logic
 * @template T The crop type
 */
export abstract class BaseParticleManager<T> implements IParticleManager<T> {
  protected config: ParticleConfig;

  constructor(config: ParticleConfig) {
    this.config = config;
  }

  /**
   * Determine if particles should be spawned
   * Must be implemented by subclasses to check crop-specific conditions
   */
  abstract shouldSpawnParticles(crop: T, windActive: boolean): boolean;

  /**
   * Spawn wind particles at a position
   * Can be overridden by subclasses for custom particle effects
   */
  spawnWindParticles(position: BlockPosition): void {
    const count = this.getParticleCount();
    
    // In a real game engine, this would create particle effects
    // For now, this is a placeholder that subclasses can override
    this.createParticleEffect(position, count);
  }

  /**
   * Update particle timers and spawn particles as needed
   */
  updateParticles(crop: T, windActive: boolean, deltaTime: number): void {
    const timer = this.getCropParticleTimer(crop);
    
    if (!this.shouldSpawnParticles(crop, windActive)) {
      // Reset timer when conditions aren't met
      this.setCropParticleTimer(crop, 0);
      return;
    }

    // Update timer
    const newTimer = timer + deltaTime;
    this.setCropParticleTimer(crop, newTimer);

    // Check if it's time to spawn particles
    const interval = this.getSpawnInterval();
    if (newTimer >= interval) {
      const position = this.getCropPosition(crop);
      this.spawnWindParticles(position);
      
      // Reset timer for next spawn
      this.setCropParticleTimer(crop, 0);
    }
  }

  /**
   * Get the number of particles to spawn (3-5 for oats)
   */
  getParticleCount(): number {
    const min = this.config.particleCountMin;
    const max = this.config.particleCountMax;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }

  /**
   * Get the spawn interval for particles (0.5-2.0 seconds for oats)
   */
  getSpawnInterval(): number {
    const min = this.config.particleIntervalMin;
    const max = this.config.particleIntervalMax;
    return min + Math.random() * (max - min);
  }

  /**
   * Get the particle timer from a crop
   * Must be implemented by subclasses
   */
  protected abstract getCropParticleTimer(crop: T): number;

  /**
   * Set the particle timer on a crop
   * Must be implemented by subclasses
   */
  protected abstract setCropParticleTimer(crop: T, timer: number): void;

  /**
   * Get the position of a crop
   * Must be implemented by subclasses
   */
  protected abstract getCropPosition(crop: T): BlockPosition;

  /**
   * Create particle effect at a position
   * Can be overridden by subclasses for custom rendering
   */
  protected createParticleEffect(position: BlockPosition, count: number): void {
    // Default implementation - subclasses can override
    // In a real game engine, this would interact with the particle system
  }
}
