import { CropRegistry } from '../registry';
import { BlockPosition } from '../interfaces';
import { HarvestEvent } from '../types';

/**
 * Game event hooks for integrating the crop system with the Hytale game engine.
 * 
 * This class provides event handlers that connect game events to the crop registry:
 * - Right-click with seed → Plant crop
 * - Left-click on mature crop → Harvest crop
 * - Game tick → Update all crops
 * - Chunk load/unload → Persist crop state
 * 
 * The hooks are generic and automatically detect crop types, making it easy
 * to add new crops without modifying the hook code.
 * 
 * Usage:
 * ```typescript
 * const registry = new CropRegistry();
 * const hooks = new GameEventHooks(registry);
 * 
 * // Register with game engine
 * gameEngine.on('rightClick', hooks.onRightClick.bind(hooks));
 * gameEngine.on('leftClick', hooks.onLeftClick.bind(hooks));
 * gameEngine.on('tick', hooks.onGameTick.bind(hooks));
 * gameEngine.on('chunkLoad', hooks.onChunkLoad.bind(hooks));
 * gameEngine.on('chunkUnload', hooks.onChunkUnload.bind(hooks));
 * ```
 * 
 * Validates: Requirements 14.2 - Game event integration
 */
export class GameEventHooks {
  /** The crop registry managing all crop systems */
  private registry: CropRegistry;
  
  /** Callback for when items are added to player inventory */
  private onItemsAdded?: (player: any, items: { itemId: string; count: number }[]) => void;
  
  /** Callback for when a seed is consumed from player inventory */
  private onSeedConsumed?: (player: any, seedItemId: string) => void;
  
  /** Callback for displaying messages to the player */
  private onDisplayMessage?: (player: any, message: string) => void;
  
  /**
   * Create new game event hooks.
   * 
   * @param registry The crop registry to use for routing events
   */
  constructor(registry: CropRegistry) {
    this.registry = registry;
  }
  
  /**
   * Set callback for when items are added to player inventory.
   * This is called after successful harvest to add the yield items.
   * 
   * @param callback Function to call when items should be added
   */
  setItemsAddedCallback(callback: (player: any, items: { itemId: string; count: number }[]) => void): void {
    this.onItemsAdded = callback;
  }
  
  /**
   * Set callback for when a seed is consumed from player inventory.
   * This is called after successful planting to remove the seed.
   * 
   * @param callback Function to call when a seed should be consumed
   */
  setSeedConsumedCallback(callback: (player: any, seedItemId: string) => void): void {
    this.onSeedConsumed = callback;
  }
  
  /**
   * Set callback for displaying messages to the player.
   * This is called to show feedback about planting/harvesting.
   * 
   * @param callback Function to call when a message should be displayed
   */
  setDisplayMessageCallback(callback: (player: any, message: string) => void): void {
    this.onDisplayMessage = callback;
  }
  
  /**
   * Handle right-click event (planting).
   * 
   * When a player right-clicks with a seed item:
   * 1. Check if the item is a registered seed
   * 2. Attempt to plant at the clicked position
   * 3. Consume the seed if successful
   * 4. Display feedback message
   * 
   * @param player The player who clicked
   * @param position The position that was clicked
   * @param heldItemId The item ID the player is holding
   * @returns True if the event was handled (seed was planted or attempted), false otherwise
   */
  onRightClick(player: any, position: BlockPosition, heldItemId: string): boolean {
    // Check if the held item is a seed
    const cropType = this.registry.getCropTypeForSeed(heldItemId);
    if (!cropType) {
      // Not a seed, don't handle this event
      return false;
    }
    
    // Attempt to plant the seed
    const result = this.registry.plantSeed(heldItemId, position, player);
    
    if (result.success) {
      // Consume the seed from player inventory
      if (this.onSeedConsumed) {
        this.onSeedConsumed(player, heldItemId);
      }
      
      // Display success message
      if (this.onDisplayMessage) {
        this.onDisplayMessage(player, `Planted ${cropType} seed`);
      }
      
      return true;
    } else {
      // Display failure message
      if (this.onDisplayMessage) {
        const messages: Record<string, string> = {
          'INVALID_SOIL': `${cropType} requires tilled soil`,
          'INVALID_BIOME': `${cropType} cannot grow in this biome`,
          'OBSTRUCTED_SPACE': 'Not enough space to plant',
          'ALREADY_PLANTED': 'A crop is already planted here'
        };
        
        const message = messages[result.reason as string] || 'Cannot plant here';
        this.onDisplayMessage(player, message);
      }
      
      return true;
    }
  }
  
  /**
   * Handle left-click event (harvesting).
   * 
   * When a player left-clicks on a block:
   * 1. Check if there's a crop at that position
   * 2. Harvest the crop
   * 3. Add yield items to player inventory
   * 4. Display feedback message
   * 
   * @param player The player who clicked
   * @param position The position that was clicked
   * @param fortuneLevel The fortune level of the tool (0-3)
   * @returns True if the event was handled (crop was harvested), false otherwise
   */
  onLeftClick(player: any, position: BlockPosition, fortuneLevel: number = 0): boolean {
    // Check if there's a crop at this position
    const crop = this.registry.getCrop(position);
    if (!crop) {
      // No crop here, don't handle this event
      return false;
    }
    
    // Harvest the crop
    const harvestEvent = this.registry.harvestCrop(position, player, fortuneLevel);
    
    if (!harvestEvent) {
      // Harvest failed (shouldn't happen if crop exists, but handle gracefully)
      return false;
    }
    
    // Add yield items to player inventory
    if (this.onItemsAdded) {
      const items: { itemId: string; count: number }[] = [];
      
      // Add grains if any
      if (harvestEvent.yield.grains > 0) {
        items.push({
          itemId: 'oat_grain', // TODO: Make this dynamic based on crop type
          count: harvestEvent.yield.grains
        });
      }
      
      // Add seeds if any
      if (harvestEvent.yield.seeds > 0) {
        items.push({
          itemId: 'oat_seed', // TODO: Make this dynamic based on crop type
          count: harvestEvent.yield.seeds
        });
      }
      
      this.onItemsAdded(player, items);
    }
    
    // Display harvest message
    if (this.onDisplayMessage) {
      const stage = crop.stage;
      if (stage === 4) {
        this.onDisplayMessage(
          player,
          `Harvested: ${harvestEvent.yield.grains} grains, ${harvestEvent.yield.seeds} seeds`
        );
      } else {
        this.onDisplayMessage(
          player,
          `Harvested immature crop: ${harvestEvent.yield.seeds} seed(s)`
        );
      }
    }
    
    return true;
  }
  
  /**
   * Handle game tick event.
   * Updates all crops across all registered systems.
   * 
   * This should be called once per game tick (typically 20 times per second).
   * 
   * @param deltaTime Time elapsed since last tick (in seconds)
   */
  onGameTick(deltaTime: number): void {
    this.registry.onTick(deltaTime);
  }
  
  /**
   * Handle chunk load event.
   * Restores all crops in the chunk from persistent storage.
   * 
   * @param chunkX Chunk X coordinate
   * @param chunkZ Chunk Z coordinate
   */
  async onChunkLoad(chunkX: number, chunkZ: number): Promise<void> {
    await this.registry.onChunkLoad({ chunkX, chunkZ });
  }
  
  /**
   * Handle chunk unload event.
   * Saves all crops in the chunk to persistent storage.
   * 
   * @param chunkX Chunk X coordinate
   * @param chunkZ Chunk Z coordinate
   */
  async onChunkUnload(chunkX: number, chunkZ: number): Promise<void> {
    await this.registry.onChunkUnload({ chunkX, chunkZ });
  }
  
  /**
   * Get statistics about the crop system.
   * Useful for debugging and monitoring.
   * 
   * @returns Statistics object
   */
  getStatistics(): {
    totalCrops: number;
    cropsByType: Map<string, number>;
    registeredTypes: string[];
  } {
    return {
      totalCrops: this.registry.getTotalCropCount(),
      cropsByType: this.registry.getCropCountsByType(),
      registeredTypes: this.registry.getRegisteredCropTypes()
    };
  }
}

/**
 * Example integration with Hytale game engine:
 * 
 * ```typescript
 * // Initialize the farming system
 * const world = new HytaleWorld();
 * const oatSystem = new OatSystem(world);
 * 
 * const registry = new CropRegistry();
 * registry.registerCropSystem('oat', oatSystem, 'oat_seed');
 * 
 * const hooks = new GameEventHooks(registry);
 * 
 * // Set up callbacks for inventory management
 * hooks.setItemsAddedCallback((player, items) => {
 *   for (const item of items) {
 *     player.inventory.addItem(item.itemId, item.count);
 *   }
 * });
 * 
 * hooks.setSeedConsumedCallback((player, seedItemId) => {
 *   player.inventory.removeItem(seedItemId, 1);
 * });
 * 
 * hooks.setDisplayMessageCallback((player, message) => {
 *   player.sendMessage(message);
 * });
 * 
 * // Register hooks with game engine
 * gameEngine.on('playerRightClick', (event) => {
 *   const handled = hooks.onRightClick(
 *     event.player,
 *     event.position,
 *     event.player.getHeldItem().id
 *   );
 *   
 *   if (handled) {
 *     event.cancel(); // Prevent default block placement
 *   }
 * });
 * 
 * gameEngine.on('playerLeftClick', (event) => {
 *   const fortuneLevel = event.player.getHeldItem().getEnchantmentLevel('fortune');
 *   const handled = hooks.onLeftClick(
 *     event.player,
 *     event.position,
 *     fortuneLevel
 *   );
 *   
 *   if (handled) {
 *     event.cancel(); // Prevent default block breaking
 *   }
 * });
 * 
 * gameEngine.on('tick', (deltaTime) => {
 *   hooks.onGameTick(deltaTime);
 * });
 * 
 * gameEngine.on('chunkLoad', (chunk) => {
 *   hooks.onChunkLoad(chunk.x, chunk.z);
 * });
 * 
 * gameEngine.on('chunkUnload', (chunk) => {
 *   hooks.onChunkUnload(chunk.x, chunk.z);
 * });
 * 
 * // Monitor system health
 * setInterval(() => {
 *   const stats = hooks.getStatistics();
 *   console.log(`Active crops: ${stats.totalCrops}`);
 *   console.log('By type:', stats.cropsByType);
 * }, 60000); // Every minute
 * ```
 */
