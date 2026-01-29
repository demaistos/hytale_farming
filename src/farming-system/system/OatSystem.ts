import { BaseCropSystem } from './BaseCropSystem';
import { OatCrop } from '../models';
import { BlockPosition } from '../interfaces';
import { oatConfig } from '../config';
import { OatGrowthEngine } from '../growth';
import { OatYieldCalculator } from '../yield';
import { OatConditionValidator } from '../validation';
import { OatBiomeManager } from '../biome';
import { OatBonusCalculator } from '../bonus';
import { OatRenderEngine } from '../render';
import { OatParticleManager } from '../particles';
import { OatPersistenceManager } from '../persistence';
import { IWorld } from '../validation/IConditionValidator';

/**
 * Oat crop management system.
 * 
 * Orchestrates all components needed to manage oat crops:
 * - Growth: 4 stages over 4 in-game days
 * - Yield: 3-4 grains + 1-2 seeds when mature
 * - Conditions: Requires tilled soil, light >= 9, clear space
 * - Biomes: Grows in most biomes except extreme environments
 * - Bonuses: +15% from water, +10% from rain
 * - Visuals: Distinctive drooping ears when mature
 * - Particles: Golden particles in wind
 * - Persistence: Saves/loads crop state across sessions
 * 
 * This system extends BaseCropSystem with oat-specific implementations.
 * 
 * Validates: All requirements (1.1-15.4)
 */
export class OatSystem extends BaseCropSystem<OatCrop> {
  /** World interface for accessing blocks and biomes */
  private world: IWorld;
  
  /**
   * Create a new oat system.
   * 
   * @param world World interface for accessing game state
   * @param storage Storage backend for persistence (optional, uses in-memory if not provided)
   */
  constructor(world: IWorld, storage?: any) {
    // Create all oat-specific components
    const conditionValidator = new OatConditionValidator(oatConfig, world);
    const growthEngine = new OatGrowthEngine(oatConfig, conditionValidator);
    const yieldCalculator = new OatYieldCalculator();
    const biomeManager = new OatBiomeManager(oatConfig);
    const bonusCalculator = new OatBonusCalculator(world, oatConfig);
    const renderEngine = new OatRenderEngine();
    const particleManager = new OatParticleManager({
      particleCountMin: oatConfig.particleCountMin,
      particleCountMax: oatConfig.particleCountMax,
      particleIntervalMin: oatConfig.particleIntervalMin,
      particleIntervalMax: oatConfig.particleIntervalMax
    });
    
    // Use provided storage or create in-memory storage
    const storageBackend = storage || new (require('../persistence/InMemoryStorage').InMemoryStorage)();
    const persistenceManager = new OatPersistenceManager(storageBackend);
    
    // Initialize base system with all components
    super(
      oatConfig,
      growthEngine,
      yieldCalculator,
      conditionValidator,
      biomeManager,
      bonusCalculator,
      renderEngine,
      particleManager,
      persistenceManager
    );
    
    this.world = world;
  }
  
  /**
   * Create a new oat crop instance.
   * Initializes at stage 1 (Germination) with zero progress.
   * 
   * Validates: Requirements 1.2
   * 
   * @param id Unique identifier for the crop
   * @param position Position in the world
   * @returns New oat crop instance
   */
  protected createCrop(id: string, position: BlockPosition): OatCrop {
    return new OatCrop(id, position);
  }
  
  /**
   * Restore an oat crop from save data.
   * 
   * @param saveData Saved crop data
   * @returns Restored oat crop instance
   */
  protected restoreCrop(saveData: any): OatCrop {
    return OatCrop.fromSaveData(saveData);
  }
  
  /**
   * Get the biome at a position.
   * Interfaces with the game world to retrieve biome information.
   * 
   * @param position Position to check
   * @returns Biome identifier
   */
  protected getBiome(position: BlockPosition): string {
    return this.world.getBiome(position);
  }
}

/**
 * Example of how other crop systems would be implemented:
 * 
 * export class WheatSystem extends BaseCropSystem<WheatCrop> {
 *   constructor(world: IWorld) {
 *     const conditionValidator = new WheatConditionValidator(wheatConfig, world);
 *     const growthEngine = new WheatGrowthEngine(wheatConfig, conditionValidator);
 *     const yieldCalculator = new WheatYieldCalculator();
 *     const biomeManager = new WheatBiomeManager();
 *     const bonusCalculator = new WheatBonusCalculator(world);
 *     const renderEngine = new WheatRenderEngine(wheatConfig);
 *     const particleManager = new WheatParticleManager(wheatConfig, world);
 *     const persistenceManager = new WheatPersistenceManager();
 *     
 *     super(
 *       wheatConfig,
 *       growthEngine,
 *       yieldCalculator,
 *       conditionValidator,
 *       biomeManager,
 *       bonusCalculator,
 *       renderEngine,
 *       particleManager,
 *       persistenceManager
 *     );
 *     
 *     this.world = world;
 *   }
 *   
 *   protected createCrop(id: string, position: BlockPosition): WheatCrop {
 *     return new WheatCrop(id, position);
 *   }
 *   
 *   protected getBiome(position: BlockPosition): string {
 *     return this.world.getBiome(position);
 *   }
 * }
 * 
 * // Usage:
 * const oatSystem = new OatSystem(world);
 * const wheatSystem = new WheatSystem(world);
 * 
 * // Both systems use the same interface
 * const systems: ICropSystem<any>[] = [oatSystem, wheatSystem];
 * 
 * // Update all crop types
 * for (const system of systems) {
 *   system.onTick(deltaTime);
 * }
 */
