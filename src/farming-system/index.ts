/**
 * Farming System - Main Entry Point
 * 
 * A generic, extensible farming system for Hytale that supports multiple crop types.
 * Currently implements oats, with architecture designed to easily add wheat, corn,
 * tomatoes, and other crops.
 * 
 * Key Features:
 * - Generic interfaces and base classes for all crop types
 * - Configurable growth, yield, and environmental systems
 * - Property-based testing for correctness guarantees
 * - Persistent crop state across game sessions
 * 
 * @module farming-system
 */

// Core interfaces
export * from './interfaces';

// Configuration
export * from './config';

// Models
export * from './models';

// Common types
export * from './types';

// Persistence
export * from './persistence';

// Validation
export * from './validation';

// Biome Management
export * from './biome';

// Bonus Calculation
export { IBonusCalculator, BaseBonusCalculator, OatBonusCalculator } from './bonus';

// Growth Engine
export * from './growth';

// Yield Calculation
export * from './yield';

// Render Engine
export * from './render';

// Particle Management
export * from './particles';

// Crop System (Main Orchestration)
export * from './system';

// Registry (Multi-Crop Management)
export * from './registry';

// Game Event Hooks (Integration Layer)
export * from './hooks';
