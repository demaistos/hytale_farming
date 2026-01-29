/**
 * Growth engine module for crop progression.
 * 
 * This module provides a generic growth system that can be used for any crop type.
 * The architecture follows the pattern:
 * - IGrowthEngine: Generic interface
 * - BaseGrowthEngine: Common implementation
 * - OatGrowthEngine: Oat-specific specialization
 * 
 * To add a new crop:
 * 1. Create a new class extending BaseGrowthEngine (e.g., WheatGrowthEngine)
 * 2. Override methods if custom behavior is needed
 * 3. Pass the crop-specific config and validator to the constructor
 */

export { IGrowthEngine } from './IGrowthEngine';
export { BaseGrowthEngine } from './BaseGrowthEngine';
export { OatGrowthEngine } from './OatGrowthEngine';
