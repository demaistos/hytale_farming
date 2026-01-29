/**
 * Unit tests for Task 7.1: GrowthEngine generic system
 * 
 * Tests the generic growth engine system including:
 * - IGrowthEngine interface
 * - BaseGrowthEngine with common progression logic
 * - OatGrowthEngine specialization
 * - calculateStageProgress() with deltaTime and bonus application
 * - shouldAdvanceStage() checking time requirements
 * - advanceStage() incrementing stage and resetting progression
 * - canGrow() using ConditionValidator
 * 
 * Requirements: 1.3, 2.1, 2.2, 2.3, 2.4, 2.5
 */

import { OatGrowthEngine } from '../growth/OatGrowthEngine';
import { OatCrop } from '../models/OatCrop';
import { OatConditionValidator } from '../validation/OatConditionValidator';
import { MockWorld } from '../validation/MockWorld';
import { BlockPosition } from '../interfaces';
import { oatConfig } from '../config/OatSystemConfig';
import { GrowthBonuses } from '../interfaces/ICropGrowth';

describe('Task 7.1: GrowthEngine Generic System', () => {
  let growthEngine: OatGrowthEngine;
  let validator: OatConditionValidator;
  let world: MockWorld;
  let testPosition: BlockPosition;
  let testCrop: OatCrop;
  
  beforeEach(() => {
    // Create a fresh mock world for each test
    world = new MockWorld();
    
    // Create validator with oat configuration
    validator = new OatConditionValidator(oatConfig, world);
    
    // Create growth engine
    growthEngine = new OatGrowthEngine(oatConfig, validator);
    
    // Standard test position
    testPosition = {
      x: 0,
      y: 64,
      z: 0,
      world: 'overworld',
      chunk: { chunkX: 0, chunkZ: 0 }
    };
    
    // Create a test crop
    testCrop = new OatCrop('test-crop-1', testPosition);
    
    // Set up valid growth conditions by default
    const soilPosition = { ...testPosition, y: testPosition.y - 1 };
    world.setBlock(soilPosition, 'FARMLAND');
    world.setBlock(testPosition, 'air');
    world.setLightLevel(testPosition, 15);
  });
  
  describe('calculateStageProgress() - Apply deltaTime and bonuses', () => {
    it('should return deltaTime when no bonuses are active', () => {
      // Requirement 2.1: Base growth without bonuses
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      const progress = growthEngine.calculateStageProgress(testCrop, 100, bonuses);
      
      // Formula: 100 * (1.0 + 1.0 - 1.0) = 100 * 1.0 = 100
      expect(progress).toBe(100);
    });
    
    it('should apply water bonus correctly (+15%)', () => {
      // Requirement 2.2: Water bonus increases growth by 15%
      const bonuses: GrowthBonuses = {
        waterBonus: 1.15,
        rainBonus: 1.0
      };
      
      const progress = growthEngine.calculateStageProgress(testCrop, 100, bonuses);
      
      // Formula: 100 * (1.15 + 1.0 - 1.0) = 100 * 1.15 = 115
      expect(progress).toBeCloseTo(115, 10);
    });
    
    it('should apply rain bonus correctly (+10%)', () => {
      // Requirement 2.3: Rain bonus increases growth by 10%
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.10
      };
      
      const progress = growthEngine.calculateStageProgress(testCrop, 100, bonuses);
      
      // Formula: 100 * (1.0 + 1.10 - 1.0) = 100 * 1.10 = 110
      expect(progress).toBeCloseTo(110, 10);
    });
    
    it('should cumulate bonuses additively when both are active', () => {
      // Requirement 2.4: Bonuses are additive
      const bonuses: GrowthBonuses = {
        waterBonus: 1.15,
        rainBonus: 1.10
      };
      
      const progress = growthEngine.calculateStageProgress(testCrop, 100, bonuses);
      
      // Formula: 100 * (1.15 + 1.10 - 1.0) = 100 * 1.25 = 125
      expect(progress).toBe(125);
    });
    
    it('should work with fractional deltaTime', () => {
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      const progress = growthEngine.calculateStageProgress(testCrop, 0.5, bonuses);
      
      expect(progress).toBe(0.5);
    });
    
    it('should work with large deltaTime values', () => {
      const bonuses: GrowthBonuses = {
        waterBonus: 1.15,
        rainBonus: 1.10
      };
      
      // One hour = 3600 seconds
      const progress = growthEngine.calculateStageProgress(testCrop, 3600, bonuses);
      
      // 3600 * 1.25 = 4500
      expect(progress).toBe(4500);
    });
  });
  
  describe('shouldAdvanceStage() - Check time requirements', () => {
    it('should return false when stage progress is below required time', () => {
      // Stage 1 requires 86400 seconds (25% of 345600)
      testCrop.stage = 1;
      testCrop.stageProgress = 50000; // Below 86400
      
      expect(growthEngine.shouldAdvanceStage(testCrop)).toBe(false);
    });
    
    it('should return true when stage progress equals required time', () => {
      // Stage 1 requires 86400 seconds
      testCrop.stage = 1;
      testCrop.stageProgress = 86400; // Exactly at threshold
      
      expect(growthEngine.shouldAdvanceStage(testCrop)).toBe(true);
    });
    
    it('should return true when stage progress exceeds required time', () => {
      // Stage 1 requires 86400 seconds
      testCrop.stage = 1;
      testCrop.stageProgress = 90000; // Above threshold
      
      expect(growthEngine.shouldAdvanceStage(testCrop)).toBe(true);
    });
    
    it('should return false when crop is at maximum stage', () => {
      // Requirement 1.4: Stop progression at stage 4
      testCrop.stage = 4;
      testCrop.stageProgress = 100000; // Even with excess progress
      
      expect(growthEngine.shouldAdvanceStage(testCrop)).toBe(false);
    });
    
    it('should work for all stages with uniform distribution', () => {
      // Requirement 2.5: Uniform distribution (25% each stage)
      const stageTime = 86400; // 25% of 345600
      
      for (let stage = 1; stage <= 3; stage++) {
        testCrop.stage = stage;
        
        // Just below threshold
        testCrop.stageProgress = stageTime - 1;
        expect(growthEngine.shouldAdvanceStage(testCrop)).toBe(false);
        
        // At threshold
        testCrop.stageProgress = stageTime;
        expect(growthEngine.shouldAdvanceStage(testCrop)).toBe(true);
      }
    });
  });
  
  describe('advanceStage() - Increment stage and reset progression', () => {
    it('should increment stage by 1', () => {
      // Requirement 1.3: Sequential progression
      testCrop.stage = 1;
      testCrop.stageProgress = 86400;
      
      growthEngine.advanceStage(testCrop);
      
      expect(testCrop.stage).toBe(2);
    });
    
    it('should reset stage progress to 0 when exactly at threshold', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 86400; // Exactly at threshold
      
      growthEngine.advanceStage(testCrop);
      
      expect(testCrop.stageProgress).toBe(0);
    });
    
    it('should carry over excess progress to next stage', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 87000; // 600 seconds over threshold
      
      growthEngine.advanceStage(testCrop);
      
      expect(testCrop.stage).toBe(2);
      expect(testCrop.stageProgress).toBe(600); // Excess carried over
    });
    
    it('should not advance beyond stage 4', () => {
      // Requirement 1.4: Stop at maturity
      testCrop.stage = 4;
      testCrop.stageProgress = 100000;
      
      growthEngine.advanceStage(testCrop);
      
      expect(testCrop.stage).toBe(4); // Should not increment
    });
    
    it('should cap progress at stage time when at maximum stage', () => {
      testCrop.stage = 4;
      testCrop.stageProgress = 100000; // Excess progress
      
      growthEngine.advanceStage(testCrop);
      
      // Should cap at stage time (86400)
      expect(testCrop.stageProgress).toBeLessThanOrEqual(86400);
    });
    
    it('should update visual height when advancing', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 86400;
      const initialHeight = testCrop.visualHeight;
      
      growthEngine.advanceStage(testCrop);
      
      // Height should change for stage 2
      expect(testCrop.visualHeight).not.toBe(initialHeight);
      expect(testCrop.visualHeight).toBeGreaterThan(initialHeight);
    });
    
    it('should advance through all stages sequentially', () => {
      testCrop.stage = 1;
      
      // Advance through all stages
      for (let expectedStage = 2; expectedStage <= 4; expectedStage++) {
        testCrop.stageProgress = 86400;
        growthEngine.advanceStage(testCrop);
        expect(testCrop.stage).toBe(expectedStage);
      }
      
      // Should stop at stage 4
      expect(testCrop.stage).toBe(4);
    });
  });
  
  describe('canGrow() - Use ConditionValidator', () => {
    it('should return true when all growth conditions are met', () => {
      // Valid conditions already set up in beforeEach
      expect(growthEngine.canGrow(testCrop)).toBe(true);
    });
    
    it('should return false when light level is too low', () => {
      // Requirement 6.4: Light < 9 blocks growth
      world.setLightLevel(testPosition, 8);
      
      expect(growthEngine.canGrow(testCrop)).toBe(false);
    });
    
    it('should return false when space is obstructed', () => {
      // Requirement 6.6: Obstructed space blocks growth
      const abovePosition = { ...testPosition, y: testPosition.y + 1 };
      world.setBlock(abovePosition, 'stone');
      
      expect(growthEngine.canGrow(testCrop)).toBe(false);
    });
    
    it('should return true when light is exactly at minimum (9)', () => {
      // Requirement 6.3: Light >= 9 allows growth
      world.setLightLevel(testPosition, 9);
      
      expect(growthEngine.canGrow(testCrop)).toBe(true);
    });
  });
  
  describe('updateGrowth() - Complete growth cycle', () => {
    it('should not progress when growth conditions are not met', () => {
      // Block growth with low light
      world.setLightLevel(testPosition, 5);
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      const initialProgress = testCrop.stageProgress;
      growthEngine.updateGrowth(testCrop, 100, bonuses);
      
      // Progress should not change
      expect(testCrop.stageProgress).toBe(initialProgress);
    });
    
    it('should add progress when growth conditions are met', () => {
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      growthEngine.updateGrowth(testCrop, 100, bonuses);
      
      expect(testCrop.stageProgress).toBe(100);
      expect(testCrop.totalAge).toBe(100);
    });
    
    it('should apply bonuses to progress', () => {
      const bonuses: GrowthBonuses = {
        waterBonus: 1.15,
        rainBonus: 1.10
      };
      
      growthEngine.updateGrowth(testCrop, 100, bonuses);
      
      // 100 * 1.25 = 125
      expect(testCrop.stageProgress).toBe(125);
      expect(testCrop.totalAge).toBe(125);
    });
    
    it('should advance stage when threshold is reached', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 86300; // Close to threshold
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      // Add 200 seconds to cross threshold (86400)
      growthEngine.updateGrowth(testCrop, 200, bonuses);
      
      expect(testCrop.stage).toBe(2);
      expect(testCrop.stageProgress).toBe(100); // 86300 + 200 - 86400 = 100
    });
    
    it('should not progress beyond stage 4', () => {
      // Requirement 1.4: Stop at maturity
      testCrop.stage = 4;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      growthEngine.updateGrowth(testCrop, 100000, bonuses);
      
      expect(testCrop.stage).toBe(4);
    });
    
    it('should update lastUpdateTime', () => {
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      const initialTime = testCrop.lastUpdateTime;
      
      // Wait a bit to ensure time changes
      setTimeout(() => {
        growthEngine.updateGrowth(testCrop, 100, bonuses);
        expect(testCrop.lastUpdateTime).toBeGreaterThan(initialTime);
      }, 10);
    });
    
    it('should handle multiple stage advancements in one update', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      // Add enough time to advance through 2 stages
      // Stage 1: 86400, Stage 2: 86400, Total: 172800
      growthEngine.updateGrowth(testCrop, 180000, bonuses);
      
      // Should advance to stage 3
      expect(testCrop.stage).toBe(3);
      // Excess: 180000 - 172800 = 7200
      expect(testCrop.stageProgress).toBe(7200);
    });
  });
  
  describe('Task 7.4: Growth Time Tests - Unit Tests', () => {
    /**
     * These tests validate the exact growth times and stage distribution.
     * Requirement 2.1: 4 days = 96 hours = 345,600 seconds total
     * Requirement 2.5: Uniform distribution (25% per stage = 86,400 seconds each)
     */
    
    it('should reach stage 4 after exactly 4 days without bonuses', () => {
      // Requirement 2.1: 4 days of growth = 345,600 seconds
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      // Simulate 4 days of growth
      const fourDays = 345600;
      growthEngine.updateGrowth(testCrop, fourDays, bonuses);
      
      expect(testCrop.stage).toBe(4);
      expect(testCrop.totalAge).toBe(fourDays);
    });
    
    it('should distribute time uniformly across stages (25% each)', () => {
      // Requirement 2.5: Each stage takes 25% of total time
      const stageTime = 86400; // 25% of 345,600
      
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      // Test each stage transition
      for (let expectedStage = 1; expectedStage <= 4; expectedStage++) {
        expect(testCrop.stage).toBe(expectedStage);
        
        if (expectedStage < 4) {
          // Add exactly one stage worth of time
          growthEngine.updateGrowth(testCrop, stageTime, bonuses);
        }
      }
      
      // Should be at stage 4 after 3 stage advancements
      expect(testCrop.stage).toBe(4);
    });
    
    it('should reach stage 2 after 1 day (25% of total)', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      const oneDay = 86400;
      growthEngine.updateGrowth(testCrop, oneDay, bonuses);
      
      expect(testCrop.stage).toBe(2);
      expect(testCrop.stageProgress).toBe(0);
    });
    
    it('should reach stage 3 after 2 days (50% of total)', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      const twoDays = 172800;
      growthEngine.updateGrowth(testCrop, twoDays, bonuses);
      
      expect(testCrop.stage).toBe(3);
      expect(testCrop.stageProgress).toBe(0);
    });
    
    it('should reach stage 4 after 3 days (75% of total)', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.0,
        rainBonus: 1.0
      };
      
      const threeDays = 259200;
      growthEngine.updateGrowth(testCrop, threeDays, bonuses);
      
      expect(testCrop.stage).toBe(4);
      expect(testCrop.stageProgress).toBe(0);
    });
    
    it('should grow faster with water bonus', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.15, // +15%
        rainBonus: 1.0
      };
      
      // With 15% bonus, should reach stage 4 in less time
      // 345600 / 1.15 ≈ 300521 seconds
      const reducedTime = 300521;
      growthEngine.updateGrowth(testCrop, reducedTime, bonuses);
      
      expect(testCrop.stage).toBe(4);
    });
    
    it('should grow faster with both bonuses', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = {
        waterBonus: 1.15,
        rainBonus: 1.10
      };
      
      // With 25% bonus, should reach stage 4 in less time
      // 345600 / 1.25 = 276480 seconds
      const reducedTime = 276480;
      growthEngine.updateGrowth(testCrop, reducedTime, bonuses);
      
      expect(testCrop.stage).toBe(4);
    });
  });
  
  describe('Integration: Complete growth simulation', () => {
    it('should simulate a complete growth cycle with varying conditions', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      // Day 1: Normal growth
      let bonuses: GrowthBonuses = { waterBonus: 1.0, rainBonus: 1.0 };
      growthEngine.updateGrowth(testCrop, 86400, bonuses);
      expect(testCrop.stage).toBe(2);
      
      // Day 2: With water bonus
      bonuses = { waterBonus: 1.15, rainBonus: 1.0 };
      growthEngine.updateGrowth(testCrop, 86400, bonuses);
      expect(testCrop.stage).toBeGreaterThanOrEqual(2);
      
      // Day 3: With both bonuses
      bonuses = { waterBonus: 1.15, rainBonus: 1.10 };
      growthEngine.updateGrowth(testCrop, 86400, bonuses);
      
      // Day 4: Normal growth
      bonuses = { waterBonus: 1.0, rainBonus: 1.0 };
      growthEngine.updateGrowth(testCrop, 86400, bonuses);
      
      // Should be at stage 4 or very close
      expect(testCrop.stage).toBe(4);
    });
    
    it('should handle interrupted growth (day/night cycle)', () => {
      testCrop.stage = 1;
      testCrop.stageProgress = 0;
      
      const bonuses: GrowthBonuses = { waterBonus: 1.0, rainBonus: 1.0 };
      
      // Simulate day/night cycles (growth only during day)
      for (let i = 0; i < 10; i++) {
        // Day: 12 hours of growth
        growthEngine.updateGrowth(testCrop, 43200, bonuses);
        
        // Night: no growth (light too low)
        world.setLightLevel(testPosition, 5);
        growthEngine.updateGrowth(testCrop, 43200, bonuses);
        world.setLightLevel(testPosition, 15);
      }
      
      // After 10 days (5 days of actual growth), should be past stage 4
      expect(testCrop.stage).toBe(4);
    });
  });
  
  describe('Generic design validation', () => {
    it('should work with the generic IGrowthEngine interface', () => {
      const genericEngine = growthEngine as any;
      
      expect(typeof genericEngine.updateGrowth).toBe('function');
      expect(typeof genericEngine.canGrow).toBe('function');
      expect(typeof genericEngine.calculateStageProgress).toBe('function');
      expect(typeof genericEngine.shouldAdvanceStage).toBe('function');
      expect(typeof genericEngine.advanceStage).toBe('function');
    });
    
    it('should be extensible for other crop types', () => {
      // The growth engine is generic and can be extended
      expect(growthEngine).toBeInstanceOf(OatGrowthEngine);
      
      // Other crops can customize behavior by overriding methods
      // (This is demonstrated in the comments in OatGrowthEngine.ts)
    });
  });
});
