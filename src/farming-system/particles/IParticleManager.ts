import { BlockPosition } from '../interfaces';

/**
 * Generic interface for managing particle effects on crops
 * @template T The crop type
 */
export interface IParticleManager<T> {
  /**
   * Determine if particles should be spawned for a crop
   * @param crop The crop to check
   * @param windActive Whether wind is currently active
   * @returns True if particles should spawn
   */
  shouldSpawnParticles(crop: T, windActive: boolean): boolean;

  /**
   * Spawn wind particles for a crop
   * @param position The position to spawn particles at
   */
  spawnWindParticles(position: BlockPosition): void;

  /**
   * Update particle timers and spawn particles as needed
   * @param crop The crop to update
   * @param windActive Whether wind is currently active
   * @param deltaTime Time elapsed since last update (in seconds)
   */
  updateParticles(crop: T, windActive: boolean, deltaTime: number): void;

  /**
   * Get the number of particles to spawn
   * @returns Random number between min and max particle count
   */
  getParticleCount(): number;

  /**
   * Get the spawn interval for particles
   * @returns Random interval in seconds between min and max
   */
  getSpawnInterval(): number;
}

/**
 * Configuration for particle effects
 */
export interface ParticleConfig {
  /** Minimum number of particles to spawn */
  particleCountMin: number;
  /** Maximum number of particles to spawn */
  particleCountMax: number;
  /** Minimum interval between particle spawns (seconds) */
  particleIntervalMin: number;
  /** Maximum interval between particle spawns (seconds) */
  particleIntervalMax: number;
}
