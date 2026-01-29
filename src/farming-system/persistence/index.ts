/**
 * Persistence module for the farming system.
 * 
 * This module provides generic persistence functionality for saving and loading
 * crop data to/from storage. It includes:
 * 
 * - ChunkCropData: Generic data structure for storing crops in chunks
 * - CropPersistenceManager: Generic persistence manager for any crop type
 * - OatPersistenceManager: Specialized persistence manager for oats
 * - InMemoryStorage: In-memory storage backend for testing
 * - IStorageBackend: Interface for implementing custom storage backends
 * 
 * The persistence system is designed to be:
 * - Generic: Works with any crop type that extends CropSaveData
 * - Extensible: Easy to add new crop types and storage backends
 * - Robust: Handles corrupted data and version incompatibilities
 * - Testable: Includes in-memory storage for testing
 * 
 * @module persistence
 */

export * from './ChunkCropData';
export * from './CropPersistenceManager';
export * from './OatPersistenceManager';
export * from './InMemoryStorage';
