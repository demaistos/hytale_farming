import { IStorageBackend } from './CropPersistenceManager';

/**
 * In-memory storage backend for testing and development.
 * Stores data in a Map without persisting to disk.
 * 
 * This implementation is useful for:
 * - Unit testing
 * - Integration testing
 * - Development and debugging
 * - Temporary storage scenarios
 * 
 * For production use, implement IStorageBackend with a real storage mechanism
 * (file system, database, etc.).
 */
export class InMemoryStorage implements IStorageBackend {
  private storage: Map<string, string>;
  
  /**
   * Create a new in-memory storage backend.
   */
  constructor() {
    this.storage = new Map();
  }
  
  /**
   * Save data to memory.
   * @param key Storage key
   * @param data Data to save
   */
  async save(key: string, data: string): Promise<void> {
    this.storage.set(key, data);
  }
  
  /**
   * Load data from memory.
   * @param key Storage key
   * @returns Loaded data or null if not found
   */
  async load(key: string): Promise<string | null> {
    return this.storage.get(key) ?? null;
  }
  
  /**
   * Delete data from memory.
   * @param key Storage key
   */
  async delete(key: string): Promise<void> {
    this.storage.delete(key);
  }
  
  /**
   * Check if data exists in memory.
   * @param key Storage key
   */
  async exists(key: string): Promise<boolean> {
    return this.storage.has(key);
  }
  
  /**
   * Clear all data from memory.
   * Useful for testing cleanup.
   */
  clear(): void {
    this.storage.clear();
  }
  
  /**
   * Get the number of items in storage.
   * Useful for testing and debugging.
   */
  size(): number {
    return this.storage.size;
  }
  
  /**
   * Get all keys in storage.
   * Useful for testing and debugging.
   */
  keys(): string[] {
    return Array.from(this.storage.keys());
  }
}
