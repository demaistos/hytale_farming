import { BaseRenderEngine } from './BaseRenderEngine';
import { StageVisuals, Orientation } from './IRenderEngine';
import { OatCrop } from '../models/OatCrop';

/**
 * Render engine specialized for oat crops
 * Implements the visual specifications for each growth stage
 */
export class OatRenderEngine extends BaseRenderEngine<OatCrop> {
  /**
   * Get the visual properties for a specific oat growth stage
   * 
   * Stage 1 (Germination): Lime green (#90EE90), 0.15 blocks, upright
   * Stage 2 (Young Sprout): Forest green (#228B22), 0.40 blocks, upright
   * Stage 3 (Growth): Gradient forest green to pale yellow, 0.70 blocks, upright
   * Stage 4 (Maturity): Golden beige (#DAA520), 0.90-1.00 blocks, drooping ears
   * 
   * Validates: Requirements 3.1, 3.2, 3.3, 3.4, 3.5, 13.1, 13.2
   */
  getStageVisuals(stage: number): StageVisuals {
    switch (stage) {
      case 1:
        // Germination: Lime green, small sprout
        return {
          color: '#90EE90',
          height: 0.15,
          orientation: Orientation.UPRIGHT
        };

      case 2:
        // Young Sprout: Forest green, developing stem
        return {
          color: '#228B22',
          height: 0.40,
          orientation: Orientation.UPRIGHT
        };

      case 3:
        // Growth: Transition from forest green to pale yellow
        return {
          color: '#228B22',
          height: 0.70,
          orientation: Orientation.UPRIGHT,
          gradientEndColor: '#F0E68C'
        };

      case 4:
        // Maturity: Golden beige, drooping ears, random height variation
        return {
          color: '#DAA520',
          height: this.getRandomMatureHeight(),
          orientation: Orientation.DROOPING
        };

      default:
        // Default to stage 1 visuals for invalid stages
        return {
          color: '#90EE90',
          height: 0.15,
          orientation: Orientation.UPRIGHT
        };
    }
  }

  /**
   * Get the current growth stage of an oat crop
   */
  protected getCropStage(crop: OatCrop): number {
    return crop.stage;
  }

  /**
   * Get a random height for mature oat crops (0.90-1.00 blocks)
   * Provides natural variation in mature crop appearance
   */
  private getRandomMatureHeight(): number {
    return 0.90 + Math.random() * 0.10;
  }
}
