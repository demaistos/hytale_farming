import { ICropSystem } from './ICropSystem';
import { ICrop, BlockPosition, ChunkCoordinates } from '../interfaces';
import { PlantResult, PlantFailureReason, HarvestEvent, CropEventType } from '../types';
import { CropConfig } from '../config';
import { IGrowthEngine } from '../growth';
import { IYieldCalculator } from '../yield';
import { IConditionValidator } from '../validation';
import { IBiomeManager } from '../biome';
import { IBonusCalculator } from '../bonus';
import { IRenderEngine } from '../render';
import { IParticleManager } from '../particles';
import { CropPersistenceManager } from '../persistence';

/**
 * Base implementation of a crop management system.
 * 
 * This class provides the common orchestration logic for all crop types.
 * Specific crops (oats, wheat, corn, etc.) extend this class and provide
 * their specialized components.
 * 
 * Architecture:
 * - Composition over inheritance: uses injected components
 * - Generic type parameter ensures type safety
 * - Position-based crop storage using Map
 * - Graceful error handling with logging
 * 
 * @template T The specific crop type (must extend ICrop)
 */
export abstract class BaseCropSystem<T extends ICrop> implements ICropSystem<T> {
  /** Map of crops by position key (format: "world:x:y:z") */
  protected crops: Map<string, T> = new Map();
  
  /** Configuration for this crop type */
  protected config: CropConfig;
  
  /** Growth engine for temporal progression */
  protected growthEngine: IGrowthEngine<T>;
  
  /** Yield calculator for harvest rewards */
  protected yieldCalculator: IYieldCalculator<T>;
  
  /** Condition validator for planting and growth */
  protected conditionValidator: IConditionValidator<T>;
  
  /** Biome manager for location restrictions */
  protected biomeManager: IBiomeManager<T>;
  
  /** Bonus calculator for environmental modifiers */
  protected bonusCalculator: IBonusCalculator<T>;
  
  /** Render engine for visual representation */
  protected renderEngine: IRenderEngine<T>;
  
  /** Particle manager for visual effects */
  protected particleManager: IParticleManager<T>;
  
  /** Persistence manager for save/load operations */
  protected persistenceManager: CropPersistenceManager<any>;
  
  /**
   * Create a new crop system.
   * 
   * @param config Configuration for this crop type
   * @param growthEngine Growth engine instance
   * @param yieldCalculator Yield calculator instance
   * @param conditionValidator Condition validator instance
   * @param biomeManager Biome manager instance
   * @param bonusCalculator Bonus calculator instance
   * @param renderEngine Render engine instance
   * @param particleManager Particle manager instance
   * @param persistenceManager Persistence manager instance
   */
  constructor(
    config: CropConfig,
    growthEngine: IGrowthEngine<T>,
    yieldCalculator: IYieldCalculator<T>,
    conditionValidator: IConditionValidator<T>,
    biomeManager: IBiomeManager<T>,
    bonusCalculator: IBonusCalculator<T>,
    renderEngine: IRenderEngine<T>,
    particleManager: IParticleManager<T>,
    persistenceManager: CropPersistenceManager<any>
  ) {
    this.config = config;
    this.growthEngine = growthEngine;
    this.yieldCalculator = yieldCalculator;
    this.conditionValidator = conditionValidator;
    this.biomeManager = biomeManager;
    this.bonusCalculator = bonusCalculator;
    this.renderEngine = renderEngine;
    this.particleManager = particleManager;
    this.persistenceManager = persistenceManager;
  }
  
  /**
   * Factory method to create a crop instance.
   * Must be implemented by subclasses to create the specific crop type.
   * 
   * @param id Unique identifier for the crop
   * @param position Position in the world
   * @returns New crop instance
   */
  protected abstract createCrop(id: string, position: BlockPosition): T;
  
  /**
   * Factory method to restore a crop from save data.
   * Must be implemented by subclasses to create and restore the specific crop type.
   * 
   * @param saveData Saved crop data
   * @returns Restored crop instance
   */
  protected abstract restoreCrop(saveData: any): T;
  
  /**
   * Get the biome at a position.
   * Must be implemented by subclasses to interface with the game world.
   * 
   * @param position Position to check
   * @returns Biome identifier
   */
  protected abstract getBiome(position: BlockPosition): string;
  
  /**
   * Plant a seed at the specified position.
   * 
   * Validates:
   * 1. Position is not already occupied
   * 2. Soil type is appropriate
   * 3. Biome is compatible
   * 4. Space above is clear
   * 
   * If all validations pass, creates a new crop at stage 1.
   * 
   * Validates: Requirements 1.2, 6.1, 6.2, 7.1-7.4
   */
  plantSeed(position: BlockPosition, player?: any): PlantResult {
    const posKey = this.getPositionKey(position);
    
    // Check if position is already occupied
    if (this.crops.has(posKey)) {
      return {
        success: false,
        reason: PlantFailureReason.ALREADY_PLANTED
      };
    }
    
    // Validate soil type
    const soilValidation = this.conditionValidator.canPlant(position);
    if (!soilValidation.valid) {
      return {
        success: false,
        reason: PlantFailureReason.INVALID_SOIL
      };
    }
    
    // Validate biome
    const biome = this.getBiome(position);
    if (!this.biomeManager.isCompatibleBiome(biome)) {
      return {
        success: false,
        reason: PlantFailureReason.INVALID_BIOME
      };
    }
    
    // Validate space above
    if (!this.conditionValidator.hasSpaceAbove(position)) {
      return {
        success: false,
        reason: PlantFailureReason.OBSTRUCTED_SPACE
      };
    }
    
    // Create new crop at stage 1 (Germination)
    const cropId = this.generateCropId();
    const crop = this.createCrop(cropId, position);
    
    // Store crop
    this.crops.set(posKey, crop);
    
    // Initial render
    this.renderEngine.renderCrop(crop, position);
    
    return {
      success: true,
      crop
    };
  }
  
  /**
   * Get the crop at the specified position.
   */
  getCrop(position: BlockPosition): T | null {
    const posKey = this.getPositionKey(position);
    return this.crops.get(posKey) || null;
  }
  
  /**
   * Remove a crop from the specified position.
   * Does not generate any yield.
   * 
   * Validates: Requirements 4.6
   */
  removeCrop(position: BlockPosition): boolean {
    const posKey = this.getPositionKey(position);
    return this.crops.delete(posKey);
  }
  
  /**
   * Update all active crops.
   * Called once per game tick to advance growth.
   * 
   * For each crop:
   * 1. Check if growth conditions are met
   * 2. Calculate environmental bonuses
   * 3. Update growth progress
   * 4. Advance stage if threshold reached
   * 5. Update visual rendering
   * 6. Update particle effects
   * 
   * Validates: Requirements 1.3, 1.4, 2.1-2.4
   */
  onTick(deltaTime: number): void {
    for (const [posKey, crop] of this.crops.entries()) {
      try {
        // Store previous stage to detect changes
        const previousStage = crop.stage;
        
        // Calculate environmental bonuses
        const bonuses = this.bonusCalculator.calculateBonuses(crop.position);
        
        // Update growth
        this.growthEngine.updateGrowth(crop, deltaTime, bonuses);
        
        // If stage changed, update render
        if (crop.stage !== previousStage) {
          this.renderEngine.updateCropVisuals(crop);
        }
        
        // Update particle effects (for mature crops with wind)
        // Note: Wind detection would come from the world/weather system
        const windActive = false; // TODO: Get from world/weather system
        this.particleManager.updateParticles(crop, windActive, deltaTime);
        
      } catch (error) {
        // Log error but continue processing other crops
        console.error(`Error updating crop at ${posKey}:`, error);
      }
    }
  }
  
  /**
   * Handle crop harvest event.
   * 
   * 1. Validates crop exists
   * 2. Calculates yield based on stage and fortune
   * 3. Removes crop from world
   * 4. Returns harvest event with yield
   * 
   * Note: Adding items to player inventory is handled by the caller,
   * as inventory systems vary by game implementation.
   * 
   * Validates: Requirements 4.1-4.6, 5.1-5.5
   */
  onPlantHarvested(position: BlockPosition, player: any, fortuneLevel: number = 0): HarvestEvent | null {
    const crop = this.getCrop(position);
    
    if (!crop) {
      console.warn(`No crop found at position for harvest: ${this.getPositionKey(position)}`);
      return null;
    }
    
    // Calculate yield
    const yieldResult = this.yieldCalculator.calculateYield(crop, fortuneLevel);
    
    // Remove crop from world
    this.removeCrop(position);
    
    // Create harvest event
    const harvestEvent: HarvestEvent = {
      type: CropEventType.HARVESTED,
      crop,
      timestamp: Date.now(),
      yield: yieldResult,
      fortuneLevel,
      player
    };
    
    return harvestEvent;
  }
  
  /**
   * Handle chunk load event.
   * Restores all crops in the chunk from persistent storage.
   * 
   * Handles corrupted data gracefully:
   * - Logs errors for corrupted crops
   * - Continues loading other crops
   * - Does not crash the system
   * 
   * Validates: Requirements 15.1, 15.2, 15.4
   */
  async onChunkLoad(chunk: ChunkCoordinates): Promise<void> {
    try {
      const result = await this.persistenceManager.loadChunk(chunk);
      
      if (!result.success) {
        console.error(`Failed to load chunk ${chunk.chunkX},${chunk.chunkZ}:`, result.error);
        return;
      }
      
      const saveDataArray = result.data?.crops || [];
      
      for (const saveData of saveDataArray) {
        try {
          // Restore crop from save data
          const crop = this.restoreCrop(saveData);
          
          const posKey = this.getPositionKey(crop.position);
          this.crops.set(posKey, crop);
          
          // Render the restored crop
          this.renderEngine.renderCrop(crop, crop.position);
          
        } catch (error) {
          console.error(`Error loading crop:`, error);
          // Continue loading other crops
        }
      }
      
    } catch (error) {
      console.error(`Error loading chunk ${chunk.chunkX},${chunk.chunkZ}:`, error);
    }
  }
  
  /**
   * Handle chunk unload event.
   * Saves all crops in the chunk to persistent storage.
   * 
   * Validates: Requirements 15.1, 15.3
   */
  async onChunkUnload(chunk: ChunkCoordinates): Promise<void> {
    try {
      // Find all crops in this chunk
      const cropsInChunk: T[] = [];
      
      for (const [posKey, crop] of this.crops.entries()) {
        if (crop.position.chunk.chunkX === chunk.chunkX && 
            crop.position.chunk.chunkZ === chunk.chunkZ) {
          cropsInChunk.push(crop);
        }
      }
      
      // Convert crops to save data
      const saveDataArray = cropsInChunk.map(crop => (crop as any).toJSON());
      
      // Save crops to persistent storage using the convenience method
      const result = await this.persistenceManager.saveCrops(chunk, saveDataArray);
      
      if (!result.success) {
        console.error(`Failed to save chunk ${chunk.chunkX},${chunk.chunkZ}:`, result.error);
        return;
      }
      
      // Remove crops from active memory
      for (const crop of cropsInChunk) {
        const posKey = this.getPositionKey(crop.position);
        this.crops.delete(posKey);
      }
      
    } catch (error) {
      console.error(`Error unloading chunk ${chunk.chunkX},${chunk.chunkZ}:`, error);
    }
  }
  
  /**
   * Get all active crops in the system.
   */
  getAllCrops(): T[] {
    return Array.from(this.crops.values());
  }
  
  /**
   * Get the number of active crops.
   */
  getCropCount(): number {
    return this.crops.size;
  }
  
  /**
   * Generate a unique position key for the crops map.
   * Format: "world:x:y:z"
   * 
   * @param position Position to convert
   * @returns Position key string
   */
  protected getPositionKey(position: BlockPosition): string {
    return `${position.world}:${position.x}:${position.y}:${position.z}`;
  }
  
  /**
   * Generate a unique crop ID.
   * Uses timestamp and random number for uniqueness.
   * 
   * @returns Unique crop ID
   */
  protected generateCropId(): string {
    return `crop_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
}
