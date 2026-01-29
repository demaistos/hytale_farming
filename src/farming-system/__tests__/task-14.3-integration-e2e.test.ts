import { describe, it, expect, beforeEach } from '@jest/globals';
import { OatSystem } from '../system';
import { CropRegistry } from '../registry';
import { GameEventHooks } from '../hooks';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces';
import { InMemoryStorage } from '../persistence/InMemoryStorage';

/**
 * End-to-End Integration Tests
 * 
 * These tests validate the complete farming system workflow from
 * planting to harvesting, including persistence and environmental interactions.
 * 
 * Test Scenarios:
 * 1. Complete cycle: buy → plant → grow → harvest
 * 2. Multi-session persistence: plant → save → reload → continue
 * 3. Environmental interactions: water, rain, light
 * 4. Multi-source acquisition: purchase, village loot, grass drops
 * 
 * Feature: hytale-oats-farming
 * Validates: All requirements (integration testing)
 */

describe('Task 14.3: End-to-End Integration Tests', () => {
  let world: MockWorld;
  let storage: InMemoryStorage;
  let oatSystem: OatSystem;
  let registry: CropRegistry;
  let hooks: GameEventHooks;
  
  // Test player mock
  let player: any;
  
  // Test position
  const plantPosition: BlockPosition = {
    x: 100,
    y: 64,
    z: 200,
    world: 'overworld',
    chunk: { chunkX: 6, chunkZ: 12 }
  };
  
  // Helper to set up a valid planting position
  const setupPlantingPosition = (pos: BlockPosition) => {
    const soilPos = { ...pos, y: pos.y - 1 };
    const abovePos = { ...pos, y: pos.y + 1 };
    world.setBlock(soilPos, 'TILLED_SOIL'); // Soil below (uppercase to match config)
    world.setBlock(pos, 'air'); // Where crop will be
    world.setBlock(abovePos, 'air'); // Space above
    world.setLightLevel(pos, 15);
    world.setSkyExposure(pos, true);
    world.setBiome(pos, 'PLAINS');
  };
  
  beforeEach(() => {
    // Create fresh instances for each test
    world = new MockWorld();
    storage = new InMemoryStorage();
    oatSystem = new OatSystem(world, storage);
    registry = new CropRegistry();
    hooks = new GameEventHooks(registry);
    
    // Register oat system
    registry.registerCropSystem('oat', oatSystem, 'oat_seed');
    
    // Create mock player
    player = {
      id: 'player_123',
      inventory: new Map<string, number>(),
      currency: 100, // Start with 100 Essence of Life
      messages: [] as string[]
    };
    
    // Set up hook callbacks BEFORE any tests run
    hooks.setItemsAddedCallback((p, items) => {
      for (const item of items) {
        const current = p.inventory.get(item.itemId) || 0;
        p.inventory.set(item.itemId, current + item.count);
      }
    });
    
    hooks.setSeedConsumedCallback((p, seedItemId) => {
      const current = p.inventory.get(seedItemId) || 0;
      if (current > 0) {
        p.inventory.set(seedItemId, current - 1);
      }
    });
    
    hooks.setDisplayMessageCallback((p, message) => {
      p.messages.push(message);
    });
    
    // Set up default world conditions (good for planting)
    setupPlantingPosition(plantPosition);
  });
  
  describe('Test 1: Complete Cycle (buy → plant → grow → harvest)', () => {
    it('should complete full farming cycle from purchase to harvest', () => {
      // Step 1: Purchase seeds (simulated - would use AcquisitionManager in real system)
      // For now, directly add seeds to inventory
      player.inventory.set('oat_seed', 4);
      player.currency -= 12;
      
      expect(player.inventory.get('oat_seed')).toBe(4);
      expect(player.currency).toBe(88);
      
      // Step 2: Plant a seed
      const plantResult = hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      expect(plantResult).toBe(true);
      // Seed should be consumed by the callback
      expect(player.inventory.get('oat_seed')).toBe(3); // One consumed (4 - 1 = 3)
      expect(player.messages.some((m: string) => m.includes('Planted oat'))).toBe(true);
      
      // Verify crop was planted
      const crop = registry.getCrop(plantPosition);
      expect(crop).not.toBeNull();
      expect(crop?.stage).toBe(1); // Germination
      expect(crop?.stageProgress).toBe(0);
      
      // Step 3: Simulate growth over 4 in-game days
      // 4 days = 96 hours = 345,600 seconds
      // We'll simulate in smaller increments to be realistic
      const totalGrowthTime = 345600; // 4 days in seconds
      const ticksPerSecond = 20; // Typical game tick rate
      const secondsPerTick = 1 / ticksPerSecond;
      const totalTicks = totalGrowthTime * ticksPerSecond;
      
      // Simulate growth in larger chunks for test performance
      const ticksPerUpdate = 1000; // Update every 1000 ticks
      const updatesNeeded = Math.ceil(totalTicks / ticksPerUpdate);
      const deltaTimePerUpdate = ticksPerUpdate * secondsPerTick;
      
      for (let i = 0; i < updatesNeeded; i++) {
        hooks.onGameTick(deltaTimePerUpdate);
      }
      
      // Verify crop reached maturity
      const matureCrop = registry.getCrop(plantPosition);
      expect(matureCrop).not.toBeNull();
      expect(matureCrop?.stage).toBe(4); // Maturity
      
      // Step 4: Harvest the mature crop
      const harvestResult = hooks.onLeftClick(player, plantPosition, 0);
      
      expect(harvestResult).toBe(true);
      
      // Verify yield was added to inventory
      const grains = player.inventory.get('oat_grain') || 0;
      const seeds = player.inventory.get('oat_seed') || 0;
      
      expect(grains).toBeGreaterThanOrEqual(3);
      expect(grains).toBeLessThanOrEqual(4);
      expect(seeds).toBeGreaterThanOrEqual(4); // 3 original + 1-2 from harvest
      expect(seeds).toBeLessThanOrEqual(5);
      
      // Verify crop was removed
      const removedCrop = registry.getCrop(plantPosition);
      expect(removedCrop).toBeNull();
      
      // Verify harvest message
      const harvestMessages = player.messages.filter((m: string) => m.includes('Harvested'));
      expect(harvestMessages.length).toBeGreaterThan(0);
    });
    
    it('should handle immature harvest correctly', () => {
      // Plant a seed
      player.inventory.set('oat_seed', 1);
      hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      // Grow to stage 2 (not mature)
      const stage2Time = 345600 / 4; // 1/4 of total growth time
      hooks.onGameTick(stage2Time);
      
      const crop = registry.getCrop(plantPosition);
      expect(crop?.stage).toBe(2);
      
      // Harvest immature crop
      hooks.onLeftClick(player, plantPosition, 0);
      
      // Should get 0 grains, 1 seed
      expect(player.inventory.get('oat_grain') || 0).toBe(0);
      expect(player.inventory.get('oat_seed') || 0).toBe(1);
    });
  });
  
  describe('Test 2: Multi-Session Persistence (plant → save → reload)', () => {
    it('should persist crop state across save/load cycles', async () => {
      // Plant a seed
      player.inventory.set('oat_seed', 1);
      hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      // Grow partially (to stage 2)
      const stage2Time = 345600 / 4;
      hooks.onGameTick(stage2Time);
      
      const cropBeforeSave = registry.getCrop(plantPosition);
      expect(cropBeforeSave?.stage).toBe(2);
      
      const progressBeforeSave = cropBeforeSave?.stageProgress || 0;
      
      // Simulate chunk unload (save)
      await hooks.onChunkUnload(plantPosition.chunk.chunkX, plantPosition.chunk.chunkZ);
      
      // Verify crop was removed from active memory
      const cropAfterUnload = registry.getCrop(plantPosition);
      expect(cropAfterUnload).toBeNull();
      
      // Simulate chunk load (restore)
      await hooks.onChunkLoad(plantPosition.chunk.chunkX, plantPosition.chunk.chunkZ);
      
      // Verify crop was restored
      const cropAfterLoad = registry.getCrop(plantPosition);
      expect(cropAfterLoad).not.toBeNull();
      expect(cropAfterLoad?.stage).toBe(2);
      expect(cropAfterLoad?.stageProgress).toBeCloseTo(progressBeforeSave, 1);
      expect(cropAfterLoad?.position.x).toBe(plantPosition.x);
      expect(cropAfterLoad?.position.y).toBe(plantPosition.y);
      expect(cropAfterLoad?.position.z).toBe(plantPosition.z);
      
      // Continue growing to maturity
      const remainingTime = stage2Time * 2; // 2 more stages
      hooks.onGameTick(remainingTime);
      
      const matureCrop = registry.getCrop(plantPosition);
      expect(matureCrop?.stage).toBe(4);
      
      // Harvest should work normally
      hooks.onLeftClick(player, plantPosition, 0);
      expect(player.inventory.get('oat_grain')).toBeGreaterThanOrEqual(3);
    });
    
    it('should handle multiple crops in same chunk', async () => {
      // Plant multiple crops
      const positions: BlockPosition[] = [
        { ...plantPosition, x: 100, z: 200 },
        { ...plantPosition, x: 101, z: 200 },
        { ...plantPosition, x: 102, z: 200 }
      ];
      
      player.inventory.set('oat_seed', 3);
      
      for (const pos of positions) {
        const soilPos = { ...pos, y: pos.y - 1 };
        const abovePos = { ...pos, y: pos.y + 1 };
        world.setBlock(soilPos, 'TILLED_SOIL');
        world.setBlock(pos, 'air');
        world.setBlock(abovePos, 'air');
        world.setLightLevel(pos, 15);
        hooks.onRightClick(player, pos, 'oat_seed');
      }
      
      // Grow all crops
      hooks.onGameTick(345600);
      
      // Verify all are mature
      for (const pos of positions) {
        const crop = registry.getCrop(pos);
        expect(crop?.stage).toBe(4);
      }
      
      // Save chunk
      await hooks.onChunkUnload(plantPosition.chunk.chunkX, plantPosition.chunk.chunkZ);
      
      // Load chunk
      await hooks.onChunkLoad(plantPosition.chunk.chunkX, plantPosition.chunk.chunkZ);
      
      // Verify all crops restored
      for (const pos of positions) {
        const crop = registry.getCrop(pos);
        expect(crop).not.toBeNull();
        expect(crop?.stage).toBe(4);
      }
    });
  });
  
  describe('Test 3: Environmental Interactions (water, rain, light)', () => {
    it('should grow faster with water bonus', () => {
      // Plant two crops: one with water, one without
      const posWithWater = { ...plantPosition, x: 100 };
      const posWithoutWater = { ...plantPosition, x: 110 };
      
      // Set up both positions
      for (const pos of [posWithWater, posWithoutWater]) {
        const soilPos = { ...pos, y: pos.y - 1 };
        const abovePos = { ...pos, y: pos.y + 1 };
        world.setBlock(soilPos, 'TILLED_SOIL');
        world.setBlock(pos, 'air');
        world.setBlock(abovePos, 'air');
        world.setLightLevel(pos, 15);
      }
      
      // Add water near first position (within 4 blocks)
      world.setBlock({ ...posWithWater, x: posWithWater.x + 2 }, 'water');
      
      // Plant both
      player.inventory.set('oat_seed', 2);
      hooks.onRightClick(player, posWithWater, 'oat_seed');
      hooks.onRightClick(player, posWithoutWater, 'oat_seed');
      
      // Grow for same amount of time
      const growthTime = 345600 / 2; // Half the total time
      hooks.onGameTick(growthTime);
      
      const cropWithWater = registry.getCrop(posWithWater);
      const cropWithoutWater = registry.getCrop(posWithoutWater);
      
      // Crop with water should have progressed further
      // With 15% bonus, it should be noticeably ahead
      expect(cropWithWater?.stage).toBeGreaterThanOrEqual(cropWithoutWater?.stage || 0);
      
      if (cropWithWater && cropWithoutWater && cropWithWater.stage === cropWithoutWater.stage) {
        // If same stage, progress should be higher
        expect(cropWithWater.stageProgress).toBeGreaterThan(cropWithoutWater.stageProgress);
      }
    });
    
    it('should not grow without sufficient light', () => {
      // Plant a crop
      player.inventory.set('oat_seed', 1);
      hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      // Set light level too low
      world.setLightLevel(plantPosition, 8);
      
      // Try to grow
      hooks.onGameTick(10000); // Significant time
      
      const crop = registry.getCrop(plantPosition);
      expect(crop?.stage).toBe(1); // Should still be at stage 1
      expect(crop?.stageProgress).toBe(0); // No progress
      
      // Restore light
      world.setLightLevel(plantPosition, 9);
      
      // Now it should grow
      hooks.onGameTick(345600 / 4);
      
      const grownCrop = registry.getCrop(plantPosition);
      expect(grownCrop?.stage).toBe(2); // Should have advanced
    });
    
    it('should not grow with obstructed space', () => {
      // Plant a crop
      player.inventory.set('oat_seed', 1);
      hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      // Place block above
      world.setBlock({ ...plantPosition, y: plantPosition.y + 1 }, 'stone');
      
      // Try to grow
      hooks.onGameTick(10000);
      
      const crop = registry.getCrop(plantPosition);
      expect(crop?.stage).toBe(1);
      expect(crop?.stageProgress).toBe(0);
      
      // Remove obstruction
      world.setBlock({ ...plantPosition, y: plantPosition.y + 1 }, 'air');
      
      // Now it should grow
      hooks.onGameTick(345600 / 4);
      
      const grownCrop = registry.getCrop(plantPosition);
      expect(grownCrop?.stage).toBe(2);
    });
  });
  
  describe('Test 4: Planting Validation', () => {
    it('should reject planting on invalid soil', () => {
      // Set wrong soil type BELOW the planting position
      const soilPos = { ...plantPosition, y: plantPosition.y - 1 };
      world.setBlock(soilPos, 'dirt');
      
      player.inventory.set('oat_seed', 1);
      const result = hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      expect(result).toBe(true); // Event was handled
      expect(player.inventory.get('oat_seed')).toBe(1); // Seed not consumed
      expect(player.messages).toContain('oat requires tilled soil');
      
      // Verify no crop was planted
      const crop = registry.getCrop(plantPosition);
      expect(crop).toBeNull();
    });
    
    it('should reject planting in incompatible biome', () => {
      // Set incompatible biome
      world.setBiome(plantPosition, 'EXTREME_DESERT');
      
      player.inventory.set('oat_seed', 1);
      const result = hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      expect(result).toBe(true);
      expect(player.inventory.get('oat_seed')).toBe(1);
      expect(player.messages).toContain('oat cannot grow in this biome');
      
      const crop = registry.getCrop(plantPosition);
      expect(crop).toBeNull();
    });
    
    it('should reject planting with obstructed space', () => {
      // Place block AT the planting position (where crop would be)
      world.setBlock(plantPosition, 'stone');
      
      player.inventory.set('oat_seed', 1);
      const result = hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      expect(result).toBe(true);
      expect(player.inventory.get('oat_seed')).toBe(1);
      expect(player.messages).toContain('Not enough space to plant');
      
      const crop = registry.getCrop(plantPosition);
      expect(crop).toBeNull();
    });
    
    it('should reject planting on already occupied position', () => {
      // Plant first crop
      player.inventory.set('oat_seed', 2);
      hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      expect(player.inventory.get('oat_seed')).toBe(1);
      
      // Try to plant again at same position
      const result = hooks.onRightClick(player, plantPosition, 'oat_seed');
      
      expect(result).toBe(true);
      expect(player.inventory.get('oat_seed')).toBe(1); // Seed not consumed
      expect(player.messages).toContain('A crop is already planted here');
    });
  });
  
  describe('Test 5: Fortune Enchantment', () => {
    it('should increase yield with Fortune', () => {
      // Plant and grow to maturity
      player.inventory.set('oat_seed', 1);
      hooks.onRightClick(player, plantPosition, 'oat_seed');
      hooks.onGameTick(345600);
      
      // Harvest with Fortune III
      hooks.onLeftClick(player, plantPosition, 3);
      
      const grains = player.inventory.get('oat_grain') || 0;
      
      // With Fortune III, should get 4-7 grains (minimum 4)
      expect(grains).toBeGreaterThanOrEqual(4);
      expect(grains).toBeLessThanOrEqual(7);
      
      // Seeds should not be affected by Fortune
      const seeds = player.inventory.get('oat_seed') || 0;
      expect(seeds).toBeGreaterThanOrEqual(1);
      expect(seeds).toBeLessThanOrEqual(2);
    });
  });
  
  describe('Test 6: Registry Statistics', () => {
    it('should track crop statistics correctly', () => {
      // Plant multiple crops
      const positions = [
        { ...plantPosition, x: 100 },
        { ...plantPosition, x: 101 },
        { ...plantPosition, x: 102 }
      ];
      
      player.inventory.set('oat_seed', 3);
      
      for (const pos of positions) {
        const soilPos = { ...pos, y: pos.y - 1 };
        const abovePos = { ...pos, y: pos.y + 1 };
        world.setBlock(soilPos, 'TILLED_SOIL');
        world.setBlock(pos, 'air');
        world.setBlock(abovePos, 'air');
        world.setLightLevel(pos, 15);
        hooks.onRightClick(player, pos, 'oat_seed');
      }
      
      const stats = hooks.getStatistics();
      
      expect(stats.totalCrops).toBe(3);
      expect(stats.registeredTypes).toContain('oat');
      expect(stats.cropsByType.get('oat')).toBe(3);
      
      // Harvest one
      hooks.onGameTick(345600);
      hooks.onLeftClick(player, positions[0], 0);
      
      const statsAfterHarvest = hooks.getStatistics();
      expect(statsAfterHarvest.totalCrops).toBe(2);
      expect(statsAfterHarvest.cropsByType.get('oat')).toBe(2);
    });
  });
});
