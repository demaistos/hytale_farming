import { BaseCrop } from './BaseCrop';
import { BlockPosition } from '../interfaces';
import { oatConfig, CropConfig } from '../config';

/**
 * Oat crop implementation.
 * Extends BaseCrop with oat-specific configuration.
 * 
 * Oats are a Tier 1 cereal crop primarily used for livestock feeding.
 * They grow through 4 stages in 4 in-game days and have distinctive
 * drooping ears when mature.
 */
export class OatCrop extends BaseCrop {
  /**
   * Create a new oat crop instance.
   * @param id Unique identifier
   * @param position Position in the world
   */
  constructor(id: string, position: BlockPosition) {
    super(id, position, oatConfig);
  }
  
  /**
   * Factory method to create an oat crop from saved data.
   * @param data Saved crop data
   * @returns Restored oat crop instance
   */
  static fromSaveData(data: any): OatCrop {
    const crop = new OatCrop(data.id, data.position);
    crop.fromJSON(data);
    return crop;
  }
}
