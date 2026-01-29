/**
 * Validation module for crop planting and growth conditions.
 * 
 * This module provides a generic, extensible system for validating:
 * - Soil requirements (different crops need different soil types)
 * - Space requirements (all crops need vertical space)
 * - Light requirements (configurable per crop)
 * - Growth conditions (light, space, etc.)
 * 
 * The system is designed to be easily extended for new crop types.
 */

export * from './IConditionValidator';
export * from './BaseConditionValidator';
export * from './OatConditionValidator';
export * from './MockWorld';
