/**
 * Unit tests for Task 5.1: BonusCalculator with water detection
 * 
 * Tests the BonusCalculator class implementation including:
 * - Water detection using Manhattan distance
 * - Rain detection with sky exposure
 * - Bonus calculation combining water and rain
 * 
 * Validates: Requirements 2.2, 2.3, 11.1, 11.2, 11.4, 12.1, 12.3
 */

import { OatBonusCalculator } from '../bonus/OatBonusCalculator';
import { MockWorld } from '../validation/MockWorld';
import { oatConfig } from '../config/OatSystemConfig';
import { BlockPosition } from '../interfaces';

describe('Task 5.1: BonusCalculator', () => {
  let calculator: OatBonusCalculator;
  let world: MockWorld;
  
  beforeEach(() => {
    world = new MockWorld();
    calculator = new OatBonusCalculator(world, oatConfig);
  });
  
  describe('hasWaterNearby - Manhattan Distance', () => {
    const centerPos: BlockPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
    
    it('should detect water at the same position', () => {
      world.setBlock(centerPos, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
    });
    
    it('should detect water 1 block north (Manhattan distance 1)', () => {
      world.setBlock({ ...centerPos, z: -1 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
    });
    
    it('should detect water 1 block east (Manhattan distance 1)', () => {
      world.setBlock({ ...centerPos, x: 1 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
    });
    
    it('should detect water 4 blocks away (Manhattan distance 4)', () => {
      // 4 blocks north
      world.setBlock({ ...centerPos, z: -4 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
      
      // Clear and test 4 blocks east
      world.clear();
      world.setBlock({ ...centerPos, x: 4 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
      
      // Clear and test 2 blocks north + 2 blocks east (Manhattan = 4)
      world.clear();
      world.setBlock({ ...centerPos, x: 2, z: -2 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
    });
    
    it('should NOT detect water beyond radius (Manhattan distance 5)', () => {
      // 5 blocks north
      world.setBlock({ ...centerPos, z: -5 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(false);
      
      // 3 blocks north + 2 blocks east (Manhattan = 5)
      world.clear();
      world.setBlock({ ...centerPos, x: 2, z: -3 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(false);
    });
    
    it('should use Manhattan distance, not Euclidean (diagonal test)', () => {
      // Diagonal: 3 blocks north + 3 blocks east
      // Euclidean distance: sqrt(3^2 + 3^2) = 4.24 (would be within radius 5)
      // Manhattan distance: 3 + 3 = 6 (outside radius 4)
      world.setBlock({ ...centerPos, x: 3, z: -3 }, 'WATER');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(false);
    });
    
    it('should return false when no water is nearby', () => {
      // No water blocks set
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(false);
    });
    
    it('should detect water with lowercase type', () => {
      world.setBlock(centerPos, 'water');
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
    });
    
    it('should work with different radius values', () => {
      world.setBlock({ ...centerPos, x: 2 }, 'WATER');
      
      expect(calculator.hasWaterNearby(centerPos, 1)).toBe(false);
      expect(calculator.hasWaterNearby(centerPos, 2)).toBe(true);
      expect(calculator.hasWaterNearby(centerPos, 3)).toBe(true);
      expect(calculator.hasWaterNearby(centerPos, 4)).toBe(true);
    });
  });
  
  describe('isRaining', () => {
    const pos: BlockPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
    
    it('should return true when raining and exposed to sky', () => {
      calculator.setRaining(true);
      world.setSkyExposure(pos, true);
      
      expect(calculator.isRaining(pos)).toBe(true);
    });
    
    it('should return false when not raining', () => {
      calculator.setRaining(false);
      world.setSkyExposure(pos, true);
      
      expect(calculator.isRaining(pos)).toBe(false);
    });
    
    it('should return false when raining but not exposed to sky', () => {
      calculator.setRaining(true);
      world.setSkyExposure(pos, false);
      
      expect(calculator.isRaining(pos)).toBe(false);
    });
    
    it('should return false when not raining and not exposed', () => {
      calculator.setRaining(false);
      world.setSkyExposure(pos, false);
      
      expect(calculator.isRaining(pos)).toBe(false);
    });
  });
  
  describe('calculateBonuses', () => {
    const pos: BlockPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
    
    it('should return no bonuses when no water and no rain', () => {
      calculator.setRaining(false);
      
      const bonuses = calculator.calculateBonuses(pos);
      
      expect(bonuses.waterBonus).toBe(1.0);
      expect(bonuses.rainBonus).toBe(1.0);
    });
    
    it('should return water bonus when water is nearby', () => {
      calculator.setRaining(false);
      world.setBlock({ ...pos, x: 2 }, 'WATER');
      
      const bonuses = calculator.calculateBonuses(pos);
      
      expect(bonuses.waterBonus).toBe(1.15); // +15%
      expect(bonuses.rainBonus).toBe(1.0);
    });
    
    it('should return rain bonus when raining and exposed', () => {
      calculator.setRaining(true);
      world.setSkyExposure(pos, true);
      
      const bonuses = calculator.calculateBonuses(pos);
      
      expect(bonuses.waterBonus).toBe(1.0);
      expect(bonuses.rainBonus).toBe(1.10); // +10%
    });
    
    it('should return both bonuses when water nearby and raining', () => {
      calculator.setRaining(true);
      world.setSkyExposure(pos, true);
      world.setBlock({ ...pos, x: 1 }, 'WATER');
      
      const bonuses = calculator.calculateBonuses(pos);
      
      expect(bonuses.waterBonus).toBe(1.15); // +15%
      expect(bonuses.rainBonus).toBe(1.10); // +10%
    });
    
    it('should use configured water detection radius', () => {
      calculator.setRaining(false);
      
      // Water at exactly radius 4 (should be detected)
      world.setBlock({ ...pos, x: 4 }, 'WATER');
      const bonuses1 = calculator.calculateBonuses(pos);
      expect(bonuses1.waterBonus).toBe(1.15);
      
      // Water at radius 5 (should NOT be detected)
      world.clear();
      world.setBlock({ ...pos, x: 5 }, 'WATER');
      const bonuses2 = calculator.calculateBonuses(pos);
      expect(bonuses2.waterBonus).toBe(1.0);
    });
    
    it('should use configured bonus multipliers', () => {
      calculator.setRaining(true);
      world.setSkyExposure(pos, true);
      world.setBlock({ ...pos, x: 1 }, 'WATER');
      
      const bonuses = calculator.calculateBonuses(pos);
      
      // Verify exact multipliers from config
      expect(bonuses.waterBonus).toBe(oatConfig.waterBonusMultiplier);
      expect(bonuses.rainBonus).toBe(oatConfig.rainBonusMultiplier);
    });
  });
  
  describe('Edge Cases', () => {
    it('should handle negative coordinates', () => {
      const pos: BlockPosition = {
        x: -100,
        y: 64,
        z: -200,
        world: 'overworld',
        chunk: { chunkX: -7, chunkZ: -13 }
      };
      
      world.setBlock({ ...pos, x: -98 }, 'WATER');
      expect(calculator.hasWaterNearby(pos, 4)).toBe(true);
    });
    
    it('should handle position at world origin', () => {
      const pos: BlockPosition = {
        x: 0,
        y: 0,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      world.setBlock({ ...pos, x: 1 }, 'WATER');
      expect(calculator.hasWaterNearby(pos, 4)).toBe(true);
    });
    
    it('should handle radius of 0', () => {
      const pos: BlockPosition = {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      };
      
      // Water at same position
      world.setBlock(pos, 'WATER');
      expect(calculator.hasWaterNearby(pos, 0)).toBe(true);
      
      // Water 1 block away
      world.clear();
      world.setBlock({ ...pos, x: 1 }, 'WATER');
      expect(calculator.hasWaterNearby(pos, 0)).toBe(false);
    });
  });
});
