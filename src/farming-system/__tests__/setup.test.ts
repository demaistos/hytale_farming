/**
 * Basic setup test to verify the testing framework is configured correctly.
 */

import { OatCrop } from '../models/OatCrop';
import { oatConfig } from '../config/OatSystemConfig';
import { BlockPosition } from '../interfaces';

describe('Farming System Setup', () => {
  it('should create an OatCrop instance', () => {
    const position: BlockPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
    
    const crop = new OatCrop('test-oat-1', position);
    
    expect(crop).toBeDefined();
    expect(crop.id).toBe('test-oat-1');
    expect(crop.position).toEqual(position);
    expect(crop.stage).toBe(1); // Should start at stage 1
    expect(crop.stageProgress).toBe(0);
  });
  
  it('should load oat configuration', () => {
    expect(oatConfig).toBeDefined();
    expect(oatConfig.stageCount).toBe(4);
    expect(oatConfig.baseGrowthTime).toBe(345600); // 4 days in seconds
    expect(oatConfig.minLightLevel).toBe(9);
    expect(oatConfig.waterBonusMultiplier).toBe(1.15);
    expect(oatConfig.rainBonusMultiplier).toBe(1.10);
  });
  
  it('should have correct stage distribution', () => {
    const sum = oatConfig.stageDistribution.reduce((a, b) => a + b, 0);
    expect(sum).toBeCloseTo(1.0, 5); // Should sum to 1.0
    expect(oatConfig.stageDistribution).toHaveLength(4);
  });
  
  it('should have correct visual configuration', () => {
    expect(oatConfig.stageVisuals).toHaveLength(4);
    
    // Stage 1: Germination
    expect(oatConfig.stageVisuals[0].color).toBe('#90EE90');
    expect(oatConfig.stageVisuals[0].height).toBe(0.15);
    
    // Stage 4: Maturity
    expect(oatConfig.stageVisuals[3].color).toBe('#DAA520');
    expect(oatConfig.stageVisuals[3].orientation).toBe('DROOPING');
  });
  
  it('should have correct yield configuration', () => {
    expect(oatConfig.grainMinBase).toBe(3);
    expect(oatConfig.grainMaxBase).toBe(4);
    expect(oatConfig.grainHighChance).toBe(0.80);
    
    expect(oatConfig.seedMinBase).toBe(1);
    expect(oatConfig.seedMaxBase).toBe(2);
    expect(oatConfig.seedHighChance).toBe(0.70);
  });
  
  it('should have correct Fortune configuration', () => {
    expect(oatConfig.fortuneGrainBonus).toEqual([0, 1, 2, 3]);
    expect(oatConfig.fortuneMinGrains).toBe(4);
  });
  
  it('should have correct acquisition configuration', () => {
    expect(oatConfig.seedPurchasePrice).toBe(12);
    expect(oatConfig.seedPurchaseQuantity).toBe(4);
    expect(oatConfig.villageLootChanceMin).toBe(0.15);
    expect(oatConfig.villageLootChanceMax).toBe(0.20);
    expect(oatConfig.grassDropChance).toBe(0.05);
  });
  
  it('should have correct biome restrictions', () => {
    expect(oatConfig.incompatibleBiomes).toContain('EXTREME_DESERT');
    expect(oatConfig.incompatibleBiomes).toContain('FROZEN_TUNDRA');
    expect(oatConfig.incompatibleBiomes).toContain('NETHER');
    expect(oatConfig.incompatibleBiomes).toContain('END');
  });
});
