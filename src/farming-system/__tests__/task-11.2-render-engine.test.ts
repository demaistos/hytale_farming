import { OatRenderEngine } from '../render/OatRenderEngine';
import { Orientation } from '../render/IRenderEngine';
import { OatCrop } from '../models/OatCrop';
import { GrowthStage } from '../types/common';

describe('Task 11.2: Render Engine Visual Tests', () => {
  let renderEngine: OatRenderEngine;

  beforeEach(() => {
    renderEngine = new OatRenderEngine();
  });

  describe('Stage 1 (Germination) Visuals', () => {
    it('should render with lime green color #90EE90', () => {
      // Requirements: 3.1
      const visuals = renderEngine.getStageVisuals(GrowthStage.GERMINATION);
      
      expect(visuals.color).toBe('#90EE90');
    });

    it('should render with height 0.15 blocks', () => {
      // Requirements: 3.1
      const visuals = renderEngine.getStageVisuals(GrowthStage.GERMINATION);
      
      expect(visuals.height).toBe(0.15);
    });

    it('should render with upright orientation', () => {
      // Requirements: 3.1
      const visuals = renderEngine.getStageVisuals(GrowthStage.GERMINATION);
      
      expect(visuals.orientation).toBe(Orientation.UPRIGHT);
    });
  });

  describe('Stage 2 (Young Sprout) Visuals', () => {
    it('should render with forest green color #228B22', () => {
      // Requirements: 3.2
      const visuals = renderEngine.getStageVisuals(GrowthStage.YOUNG_SPROUT);
      
      expect(visuals.color).toBe('#228B22');
    });

    it('should render with height 0.40 blocks', () => {
      // Requirements: 3.2
      const visuals = renderEngine.getStageVisuals(GrowthStage.YOUNG_SPROUT);
      
      expect(visuals.height).toBe(0.40);
    });

    it('should render with upright orientation', () => {
      // Requirements: 3.2
      const visuals = renderEngine.getStageVisuals(GrowthStage.YOUNG_SPROUT);
      
      expect(visuals.orientation).toBe(Orientation.UPRIGHT);
    });
  });

  describe('Stage 3 (Growth) Visuals', () => {
    it('should render with forest green base color #228B22', () => {
      // Requirements: 3.3
      const visuals = renderEngine.getStageVisuals(GrowthStage.GROWTH);
      
      expect(visuals.color).toBe('#228B22');
    });

    it('should render with gradient transition to pale yellow #F0E68C', () => {
      // Requirements: 3.3
      const visuals = renderEngine.getStageVisuals(GrowthStage.GROWTH);
      
      expect(visuals.gradientEndColor).toBe('#F0E68C');
    });

    it('should render with height 0.70 blocks', () => {
      // Requirements: 3.3
      const visuals = renderEngine.getStageVisuals(GrowthStage.GROWTH);
      
      expect(visuals.height).toBe(0.70);
    });

    it('should render with upright orientation', () => {
      // Requirements: 3.3
      const visuals = renderEngine.getStageVisuals(GrowthStage.GROWTH);
      
      expect(visuals.orientation).toBe(Orientation.UPRIGHT);
    });
  });

  describe('Stage 4 (Maturity) Visuals', () => {
    it('should render with golden beige color #DAA520', () => {
      // Requirements: 3.4
      const visuals = renderEngine.getStageVisuals(GrowthStage.MATURITY);
      
      expect(visuals.color).toBe('#DAA520');
    });

    it('should render with height between 0.90 and 1.00 blocks', () => {
      // Requirements: 3.4
      // Test multiple times to verify randomization stays in range
      for (let i = 0; i < 100; i++) {
        const visuals = renderEngine.getStageVisuals(GrowthStage.MATURITY);
        
        expect(visuals.height).toBeGreaterThanOrEqual(0.90);
        expect(visuals.height).toBeLessThanOrEqual(1.00);
      }
    });

    it('should render with drooping ears orientation', () => {
      // Requirements: 3.5, 13.1
      const visuals = renderEngine.getStageVisuals(GrowthStage.MATURITY);
      
      expect(visuals.orientation).toBe(Orientation.DROOPING);
    });

    it('should have natural height variation across multiple mature crops', () => {
      // Requirements: 3.4
      // Verify that heights are not all the same (natural variation)
      const heights = new Set<number>();
      
      for (let i = 0; i < 50; i++) {
        const visuals = renderEngine.getStageVisuals(GrowthStage.MATURITY);
        heights.add(visuals.height);
      }
      
      // With 50 samples, we should have multiple different heights
      expect(heights.size).toBeGreaterThan(10);
    });
  });

  describe('Crop Rendering Integration', () => {
    it('should render crop with correct visuals based on stage', () => {
      // Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
      const crop = new OatCrop('test-crop-1', {
        x: 0,
        y: 64,
        z: 0,
        world: 'overworld',
        chunk: { chunkX: 0, chunkZ: 0 }
      });

      // Test each stage
      crop.stage = GrowthStage.GERMINATION;
      renderEngine.updateCropVisuals(crop);
      let visuals = renderEngine.getStageVisuals(crop.stage);
      expect(visuals.color).toBe('#90EE90');
      expect(visuals.height).toBe(0.15);

      crop.stage = GrowthStage.YOUNG_SPROUT;
      renderEngine.updateCropVisuals(crop);
      visuals = renderEngine.getStageVisuals(crop.stage);
      expect(visuals.color).toBe('#228B22');
      expect(visuals.height).toBe(0.40);

      crop.stage = GrowthStage.GROWTH;
      renderEngine.updateCropVisuals(crop);
      visuals = renderEngine.getStageVisuals(crop.stage);
      expect(visuals.color).toBe('#228B22');
      expect(visuals.height).toBe(0.70);

      crop.stage = GrowthStage.MATURITY;
      renderEngine.updateCropVisuals(crop);
      visuals = renderEngine.getStageVisuals(crop.stage);
      expect(visuals.color).toBe('#DAA520');
      expect(visuals.orientation).toBe(Orientation.DROOPING);
    });

    it('should handle invalid stage gracefully', () => {
      // Edge case: invalid stage should default to stage 1 visuals
      const visuals = renderEngine.getStageVisuals(999);
      
      expect(visuals.color).toBe('#90EE90');
      expect(visuals.height).toBe(0.15);
      expect(visuals.orientation).toBe(Orientation.UPRIGHT);
    });
  });

  describe('Visual Distinction from Wheat', () => {
    it('should have drooping orientation at maturity (distinct from wheat)', () => {
      // Requirements: 13.1, 13.2
      const visuals = renderEngine.getStageVisuals(GrowthStage.MATURITY);
      
      // Oats have drooping ears, wheat has upright ears
      expect(visuals.orientation).toBe(Orientation.DROOPING);
    });

    it('should have golden beige color at maturity (distinct from wheat yellow)', () => {
      // Requirements: 13.2
      const visuals = renderEngine.getStageVisuals(GrowthStage.MATURITY);
      
      // Oats are golden beige (#DAA520), wheat is bright yellow
      expect(visuals.color).toBe('#DAA520');
      expect(visuals.color).not.toBe('#FFFF00'); // Not bright yellow
    });
  });
});
