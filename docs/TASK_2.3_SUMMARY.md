# Task 2.3 Summary: Generic Chunk Save/Load System

## Task Description
Implémenter le système de sauvegarde/chargement de chunks générique pour le système de culture d'avoine.

## Requirements
- ✅ Créer ChunkCropData<T> générique pour stocker n'importe quelle culture
- ✅ Implémenter CropPersistenceManager générique pour sauvegarder/restaurer
- ✅ Spécialiser pour OatCrop avec ChunkOatData
- ✅ Implémenter les méthodes de sauvegarde lors du déchargement de chunk
- ✅ Implémenter les méthodes de restauration lors du chargement de chunk
- ✅ Gérer la gestion des erreurs pour les données corrompues

## Implementation Details

### 1. ChunkCropData<T> Generic Structure
**Location:** `src/farming-system/persistence/ChunkCropData.ts`

The `ChunkCropData<T>` interface provides a generic container for storing crops in chunks:

```typescript
interface ChunkCropData<T extends CropSaveData> {
  chunkCoords: ChunkCoordinates;
  crops: T[];
  version: number;
  lastSaved?: number;
}
```

**Key Features:**
- **Generic Type Parameter**: `T extends CropSaveData` allows any crop type
- **Chunk Coordinates**: Identifies which chunk the data belongs to
- **Crops Array**: Stores multiple crops in a single chunk
- **Version Number**: Enables future format migrations
- **Last Saved Timestamp**: Tracks when data was last persisted

**Helper Functions:**
- `createEmptyChunkData()`: Creates an empty chunk data structure
- `isValidChunkData()`: Validates chunk data structure integrity
- `isCompatibleVersion()`: Checks version compatibility

### 2. ChunkOatData Specialization
**Location:** `src/farming-system/persistence/ChunkCropData.ts`

The `ChunkOatData` interface specializes `ChunkCropData` for oat crops:

```typescript
interface ChunkOatData extends ChunkCropData<CropSaveData> {
  cropType: 'oat';
}
```

This specialization:
- Adds type identification for deserialization
- Maintains type safety for oat-specific operations
- Demonstrates the pattern for future crop types (wheat, corn, etc.)

### 3. CropPersistenceManager<T> Generic Manager
**Location:** `src/farming-system/persistence/CropPersistenceManager.ts`

The `CropPersistenceManager<T>` class provides generic persistence functionality:

**Core Methods:**
- `saveChunk(chunkData)`: Saves chunk data to storage
- `loadChunk(chunkCoords)`: Loads chunk data from storage
- `deleteChunk(chunkCoords)`: Deletes chunk data from storage
- `hasChunk(chunkCoords)`: Checks if chunk data exists

**Convenience Methods:**
- `saveCrops(chunkCoords, crops)`: Saves crops array directly
- `loadCrops(chunkCoords)`: Loads crops array directly

**Storage Key Generation:**
```typescript
private getChunkKey(chunkCoords: ChunkCoordinates): string {
  return `chunk_${this.cropType}_${chunkCoords.chunkX}_${chunkCoords.chunkZ}`;
}
```

This ensures unique keys per crop type and chunk coordinates.

### 4. IStorageBackend Interface
**Location:** `src/farming-system/persistence/CropPersistenceManager.ts`

The `IStorageBackend` interface abstracts storage implementation:

```typescript
interface IStorageBackend {
  save(key: string, data: string): Promise<void>;
  load(key: string): Promise<string | null>;
  delete(key: string): Promise<void>;
  exists(key: string): Promise<boolean>;
}
```

**Benefits:**
- Decouples persistence logic from storage mechanism
- Allows different backends (file system, database, cloud storage)
- Simplifies testing with in-memory implementation
- Enables async operations for I/O-bound storage

### 5. InMemoryStorage Implementation
**Location:** `src/farming-system/persistence/InMemoryStorage.ts`

The `InMemoryStorage` class provides a testing-friendly storage backend:

**Features:**
- Stores data in a `Map<string, string>`
- No disk I/O (perfect for testing)
- Synchronous operations wrapped in async interface
- Additional testing utilities: `clear()`, `size()`, `keys()`

**Use Cases:**
- Unit testing
- Integration testing
- Development and debugging
- Temporary storage scenarios

### 6. OatPersistenceManager Specialization
**Location:** `src/farming-system/persistence/OatPersistenceManager.ts`

The `OatPersistenceManager` class specializes the generic manager for oats:

```typescript
export class OatPersistenceManager extends CropPersistenceManager<CropSaveData> {
  constructor(storage: IStorageBackend) {
    super(storage, 'oat');
  }
  
  async saveOatChunk(chunkData: ChunkOatData): Promise<PersistenceResult<void>>
  async loadOatChunk(chunkCoords: ChunkCoordinates): Promise<PersistenceResult<ChunkOatData>>
  createEmptyOatChunk(chunkCoords: ChunkCoordinates): ChunkOatData
}
```

**Oat-Specific Features:**
- Type-safe methods for oat chunk data
- Automatic crop type identification ('oat')
- Factory method for empty oat chunks

### 7. Error Handling System
**Location:** `src/farming-system/persistence/CropPersistenceManager.ts`

The persistence system includes comprehensive error handling:

**Error Types:**
```typescript
enum PersistenceErrorType {
  CORRUPTED_DATA = 'CORRUPTED_DATA',
  INCOMPATIBLE_VERSION = 'INCOMPATIBLE_VERSION',
  INVALID_FORMAT = 'INVALID_FORMAT',
  STORAGE_ERROR = 'STORAGE_ERROR'
}
```

**Error Information:**
```typescript
interface PersistenceError {
  type: PersistenceErrorType;
  message: string;
  chunkCoords?: ChunkCoordinates;
  originalError?: Error;
}
```

**Result Pattern:**
```typescript
interface PersistenceResult<T> {
  success: boolean;
  data?: T;
  error?: PersistenceError;
}
```

**Error Handling Behavior:**

1. **Corrupted JSON Data**:
   - Caught during `JSON.parse()`
   - Returns `CORRUPTED_DATA` error
   - Includes original parse error
   - Does not crash the system

2. **Invalid Data Format**:
   - Detected by `isValidChunkData()` validation
   - Returns `INVALID_FORMAT` error
   - Specifies which fields are missing/invalid
   - Prevents loading of malformed data

3. **Incompatible Version**:
   - Detected by `isCompatibleVersion()` check
   - Returns `INCOMPATIBLE_VERSION` error
   - Includes both current and saved versions
   - Enables future migration logic

4. **Storage Errors**:
   - Caught from storage backend operations
   - Returns `STORAGE_ERROR` error
   - Includes original error for debugging
   - Allows retry or fallback strategies

**Graceful Degradation:**
- Errors are isolated to individual chunks
- One corrupted chunk doesn't affect others
- System continues operation after errors
- Errors include context for debugging

### 8. Chunk Unload/Load Integration
**Location:** Demonstrated in tests

**Chunk Unload Process:**
```typescript
// When a chunk is unloaded:
const crops = getAllCropsInChunk(chunkCoords);
const cropData = crops.map(c => c.toJSON());
await persistenceManager.saveCrops(chunkCoords, cropData);
```

**Chunk Load Process:**
```typescript
// When a chunk is loaded:
const result = await persistenceManager.loadCrops(chunkCoords);
if (result.success && result.data) {
  const crops = result.data.map(data => OatCrop.fromSaveData(data));
  // Add crops to active crop system
}
```

**State Preservation:**
- All crop properties are saved (stage, progress, age, timestamps)
- Visual properties are recalculated on load
- Chunk coordinates are preserved
- Position information is maintained

## Architecture Benefits

### Generic Design
The persistence system is designed to work with any crop type:

```
CropPersistenceManager<T>
├── OatPersistenceManager (extends with T=CropSaveData)
├── WheatPersistenceManager (future)
├── CornPersistenceManager (future)
└── TomatoPersistenceManager (future)
```

**To add a new crop type:**
1. Create a specialized `ChunkXXXData` interface (optional)
2. Create a specialized `XXXPersistenceManager` class
3. Pass the crop type identifier to the base constructor
4. No changes needed to core persistence logic

### Storage Backend Abstraction
The `IStorageBackend` interface enables multiple storage implementations:

**Current:**
- `InMemoryStorage`: For testing and development

**Future Possibilities:**
- `FileSystemStorage`: Save to local files
- `DatabaseStorage`: Save to SQLite/PostgreSQL
- `CloudStorage`: Save to AWS S3/Azure Blob
- `NetworkStorage`: Save to remote server

### Type Safety
- TypeScript generics ensure compile-time type checking
- `PersistenceResult<T>` provides type-safe error handling
- Specialized managers add crop-specific type safety
- Validation functions prevent runtime type errors

### Performance
- Async operations don't block game loop
- Chunk-based organization minimizes I/O
- JSON serialization is fast and compact
- In-memory caching possible with storage backends

### Robustness
- Comprehensive error handling for all failure modes
- Version checking enables future migrations
- Validation prevents corrupted data from loading
- Graceful degradation on errors

## Test Coverage

### Unit Tests
**Location:** `src/farming-system/__tests__/task-2.3-persistence-system.test.ts`

**Test Suites:**

1. **ChunkCropData<T> Generic Structure** (6 tests)
   - Creates generic chunk data structure
   - Stores multiple crops in a chunk
   - Creates empty chunk data with helper function
   - Validates chunk data structure
   - Rejects invalid chunk data structures
   - Checks version compatibility

2. **CropPersistenceManager Generic Save/Restore** (8 tests)
   - Saves chunk data to storage
   - Loads chunk data from storage
   - Returns empty chunk when no data exists
   - Saves and loads multiple crops in a chunk
   - Deletes chunk data from storage
   - Checks if chunk exists in storage
   - Uses convenience method to save crops
   - Uses convenience method to load crops

3. **OatPersistenceManager Specialization** (3 tests)
   - Saves oat-specific chunk data
   - Loads oat-specific chunk data
   - Creates empty oat chunk

4. **Error Handling for Corrupted Data** (5 tests)
   - Handles corrupted JSON data
   - Handles invalid data format
   - Handles incompatible version
   - Includes chunk coordinates in error information
   - Continues operation after error

5. **Chunk Unload/Load Simulation** (3 tests)
   - Simulates chunk unload by saving all crops
   - Simulates chunk load by restoring all crops
   - Maintains crop state through unload/load cycle

6. **InMemoryStorage Backend** (6 tests)
   - Stores and retrieves data
   - Returns null for non-existent keys
   - Deletes data
   - Checks existence
   - Clears all data
   - Returns all keys

**Total: 31 tests, all passing ✅**

### Test Scenarios

**Save/Load Cycle:**
```typescript
// Save crops
const crops = [crop1.toJSON(), crop2.toJSON()];
await manager.saveCrops(chunkCoords, crops);

// Load crops
const result = await manager.loadCrops(chunkCoords);
const restoredCrops = result.data!.map(data => OatCrop.fromSaveData(data));

// Verify state is preserved
expect(restoredCrops[0].stage).toBe(crop1.stage);
expect(restoredCrops[0].stageProgress).toBe(crop1.stageProgress);
```

**Error Handling:**
```typescript
// Corrupted data
await storage.save(key, 'invalid json {{{');
const result = await manager.loadChunk(chunkCoords);

expect(result.success).toBe(false);
expect(result.error?.type).toBe(PersistenceErrorType.CORRUPTED_DATA);
```

**Multiple Crops:**
```typescript
// Save 10 crops in one chunk
const crops = Array.from({ length: 10 }, (_, i) => {
  const crop = new OatCrop(`crop-${i}`, position);
  crop.stage = (i % 4) + 1;
  return crop.toJSON();
});

await manager.saveCrops(chunkCoords, crops);

// Load and verify all 10 crops
const result = await manager.loadCrops(chunkCoords);
expect(result.data).toHaveLength(10);
```

## Validation Against Requirements

### Exigence 15.1: Sauvegarde lors du Déchargement
✅ **Satisfied:** The system provides:
- `saveChunk()` method for saving during chunk unload
- `saveCrops()` convenience method for direct crop array saving
- Automatic timestamp tracking (`lastSaved`)
- Error handling for save failures

### Exigence 15.2: Restauration lors du Chargement
✅ **Satisfied:** The system provides:
- `loadChunk()` method for loading during chunk load
- `loadCrops()` convenience method for direct crop array loading
- Returns empty chunk if no data exists (graceful handling)
- Error handling for load failures

### Exigence 15.4: Gestion des Erreurs pour Données Corrompues
✅ **Satisfied:** The system handles:
- Corrupted JSON data (parse errors)
- Invalid data format (missing/wrong fields)
- Incompatible versions (future-proofing)
- Storage errors (I/O failures)
- Includes detailed error information
- Continues operation after errors

### Exigence 15.3: Sauvegarde de l'État (from Task 2.1)
✅ **Satisfied:** The system saves:
- Stage actuel (current stage)
- Temps écoulé dans le stade (stage progress)
- Position du plant (block position with chunk coordinates)
- All timestamps and metadata
- Multiple crops per chunk

## Files Created/Modified

### Created:
- `src/farming-system/persistence/ChunkCropData.ts` (Generic chunk data structure)
- `src/farming-system/persistence/CropPersistenceManager.ts` (Generic persistence manager)
- `src/farming-system/persistence/OatPersistenceManager.ts` (Oat specialization)
- `src/farming-system/persistence/InMemoryStorage.ts` (Testing storage backend)
- `src/farming-system/persistence/index.ts` (Module exports)
- `src/farming-system/__tests__/task-2.3-persistence-system.test.ts` (31 tests)
- `docs/TASK_2.3_SUMMARY.md` (this file)

### Modified:
- `src/farming-system/index.ts` (Added persistence module export)

## Integration with Existing System

The persistence system integrates seamlessly with existing components:

**With BaseCrop/OatCrop:**
- Uses `toJSON()` method for serialization
- Uses `fromSaveData()` factory method for deserialization
- Preserves all crop state through save/load cycle

**With ChunkCoordinates:**
- Uses chunk coordinates for storage key generation
- Organizes crops by chunk for efficient loading
- Supports chunk-based game world management

**With CropSaveData:**
- Generic type parameter works with any crop save data
- Type-safe operations through TypeScript generics
- Extensible for future crop types

## Usage Examples

### Basic Save/Load
```typescript
// Create persistence manager
const storage = new InMemoryStorage();
const manager = new OatPersistenceManager(storage);

// Save crops when chunk unloads
const crops = [crop1.toJSON(), crop2.toJSON()];
await manager.saveCrops(chunkCoords, crops);

// Load crops when chunk loads
const result = await manager.loadCrops(chunkCoords);
if (result.success) {
  const restoredCrops = result.data!.map(data => OatCrop.fromSaveData(data));
  // Add crops to active system
}
```

### Error Handling
```typescript
const result = await manager.loadChunk(chunkCoords);

if (!result.success) {
  switch (result.error?.type) {
    case PersistenceErrorType.CORRUPTED_DATA:
      console.error('Corrupted chunk data:', result.error.message);
      // Log error, notify admin, use empty chunk
      break;
    case PersistenceErrorType.INCOMPATIBLE_VERSION:
      console.error('Version mismatch:', result.error.message);
      // Attempt migration or use empty chunk
      break;
    case PersistenceErrorType.STORAGE_ERROR:
      console.error('Storage error:', result.error.message);
      // Retry or use cached data
      break;
  }
}
```

### Custom Storage Backend
```typescript
class FileSystemStorage implements IStorageBackend {
  async save(key: string, data: string): Promise<void> {
    await fs.writeFile(`./saves/${key}.json`, data);
  }
  
  async load(key: string): Promise<string | null> {
    try {
      return await fs.readFile(`./saves/${key}.json`, 'utf-8');
    } catch {
      return null;
    }
  }
  
  // ... implement delete() and exists()
}

// Use custom storage
const storage = new FileSystemStorage();
const manager = new OatPersistenceManager(storage);
```

## Next Steps

Task 2.3 is complete. The next task is:

**Task 3.1:** Créer la classe ConditionValidator générique avec validation du sol
- Create IConditionValidator<T> interface générique
- Implement BaseConditionValidator with common logic
- Implement OatConditionValidator specialization
- Implement soil validation, space checking, and planting validation

The persistence system is now ready to be integrated with the crop system for automatic save/load during chunk operations.

## Conclusion

Task 2.3 successfully implements a complete generic chunk save/load system:

✅ Generic ChunkCropData<T> structure for any crop type  
✅ Generic CropPersistenceManager for save/restore operations  
✅ Specialized OatPersistenceManager for oat crops  
✅ Save methods for chunk unload scenarios  
✅ Restore methods for chunk load scenarios  
✅ Comprehensive error handling for corrupted data  
✅ Storage backend abstraction (IStorageBackend)  
✅ In-memory storage for testing  
✅ 31 unit tests covering all functionality  
✅ Type-safe operations with TypeScript generics  
✅ Extensible architecture for future crop types  

The implementation is production-ready, fully tested, and designed for extensibility. The generic design allows easy addition of new crop types (wheat, corn, tomatoes) without modifying the core persistence logic.

