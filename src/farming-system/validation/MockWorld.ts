import { BlockPosition } from '../interfaces';
import { IWorld, Block } from './IConditionValidator';

/**
 * Mock world implementation for testing.
 * Allows setting up test scenarios with specific blocks, light levels, etc.
 */
export class MockWorld implements IWorld {
  private blocks: Map<string, Block>;
  private lightLevels: Map<string, number>;
  private skyExposure: Map<string, boolean>;
  private biomes: Map<string, string>;
  
  constructor() {
    this.blocks = new Map();
    this.lightLevels = new Map();
    this.skyExposure = new Map();
    this.biomes = new Map();
  }
  
  /**
   * Convert a position to a string key for the maps.
   */
  private positionKey(position: BlockPosition): string {
    return `${position.x},${position.y},${position.z}`;
  }
  
  /**
   * Set a block at a specific position.
   * @param position Position to set
   * @param type Block type
   */
  setBlock(position: BlockPosition, type: string): void {
    const key = this.positionKey(position);
    this.blocks.set(key, { type, position });
  }
  
  /**
   * Set the light level at a specific position.
   * @param position Position to set
   * @param level Light level (0-15)
   */
  setLightLevel(position: BlockPosition, level: number): void {
    const key = this.positionKey(position);
    this.lightLevels.set(key, level);
  }
  
  /**
   * Set whether a position is exposed to the sky.
   * @param position Position to set
   * @param exposed True if exposed
   */
  setSkyExposure(position: BlockPosition, exposed: boolean): void {
    const key = this.positionKey(position);
    this.skyExposure.set(key, exposed);
  }
  
  /**
   * Set the biome at a specific position.
   * @param position Position to set
   * @param biome Biome identifier (e.g., "PLAINS", "FOREST")
   */
  setBiome(position: BlockPosition, biome: string): void {
    const key = this.positionKey(position);
    this.biomes.set(key, biome);
  }
  
  /**
   * Get the block at the given position.
   * Returns air if no block is set.
   */
  getBlock(position: BlockPosition): Block {
    const key = this.positionKey(position);
    return this.blocks.get(key) || { type: 'air', position };
  }
  
  /**
   * Get the light level at the given position.
   * Returns 15 (full light) if not set.
   */
  getLightLevel(position: BlockPosition): number {
    const key = this.positionKey(position);
    return this.lightLevels.get(key) ?? 15;
  }
  
  /**
   * Check if a position is exposed to the sky.
   * Returns true if not set.
   */
  isExposedToSky(position: BlockPosition): boolean {
    const key = this.positionKey(position);
    return this.skyExposure.get(key) ?? true;
  }
  
  /**
   * Get the biome at the given position.
   * Returns "PLAINS" if not set.
   */
  getBiome(position: BlockPosition): string {
    const key = this.positionKey(position);
    return this.biomes.get(key) ?? 'PLAINS';
  }
  
  /**
   * Clear all data from the mock world.
   */
  clear(): void {
    this.blocks.clear();
    this.lightLevels.clear();
    this.skyExposure.clear();
    this.biomes.clear();
  }
}
