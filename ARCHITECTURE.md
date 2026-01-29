# Farming System Architecture

## Overview

The farming system is designed as a **generic, extensible framework** that can support multiple crop types. The architecture follows SOLID principles and uses TypeScript's type system to ensure type safety and maintainability.

## Design Principles

### 1. Generic First
All core components are designed to work with any crop type, not just oats. This is achieved through:
- Generic interfaces (`ICrop`, `ICropGrowth<T>`, `ICropYield<T>`)
- Abstract base classes (`BaseCrop`)
- Configuration-driven behavior (`CropConfig`)

### 2. Composition Over Inheritance
Rather than creating deep inheritance hierarchies, the system uses composition:
- Crops contain configuration objects
- Systems compose multiple specialized components (validators, calculators, engines)

### 3. Separation of Concerns
Each component has a single, well-defined responsibility:
- **Models**: Data structures and state management
- **Interfaces**: Contracts for behavior
- **Config**: Parameterization and customization
- **Types**: Shared type definitions

## Core Components

### Interfaces Layer

#### ICrop
The fundamental interface that all crops must implement. Defines:
- Identity (id, position)
- Growth state (stage, progress, age)
- Temporal data (planted time, last update)
- Visual state (height, particles)

#### ICropGrowth<T>
Defines the contract for growth management:
- `updateGrowth()`: Apply time-based progression
- `canGrow()`: Check environmental conditions
- `calculateStageProgress()`: Compute growth amount
- `shouldAdvanceStage()`: Determine stage transitions
- `advanceStage()`: Execute stage progression

#### ICropYield<T>
Defines the contract for harvest calculations:
- `calculateYield()`: Compute total harvest
- `calculateItemCount()`: Compute specific item quantities

### Configuration Layer

#### CropConfig
A comprehensive interface that parameterizes all aspects of a crop:

**Growth Parameters**:
- `baseGrowthTime`: Total time to maturity
- `stageDistribution`: Time allocation per stage
- `stageCount`: Number of growth stages

**Environmental Bonuses**:
- `waterBonusMultiplier`: Growth speed near water
- `rainBonusMultiplier`: Growth speed in rain
- `waterDetectionRadius`: Range for water detection

**Yield Parameters**:
- `grainMinBase`, `grainMaxBase`: Primary item range
- `grainHighChance`: Probability distribution
- `seedMinBase`, `seedMaxBase`: Seed range
- `seedHighChance`: Seed probability

**Fortune Enchantment**:
- `fortuneGrainBonus`: Bonus per Fortune level
- `fortuneMinGrains`: Guaranteed minimum with Fortune

**Growth Conditions**:
- `minLightLevel`: Required light for growth
- `validSoilTypes`: Acceptable soil blocks

**Acquisition**:
- Purchase pricing and quantities
- Village loot probabilities and ranges
- Grass drop chances and biomes

**Visual Properties**:
- `stageVisuals`: Array of visual configs per stage
- Colors, heights, orientations

**Restrictions**:
- `incompatibleBiomes`: Where crop cannot grow

#### OatSystemConfig
Concrete implementation of `CropConfig` for oats. All values are based on the requirements document:
- 4 stages, 4 in-game days (345,600 seconds)
- Water +15%, Rain +10%
- 3-4 grains (80% for 4), 1-2 seeds (70% for 2)
- Fortune I/II/III: max 5/6/7 grains
- Light level ≥ 9
- 12 Life Essence for 4 seeds
- And more...

### Model Layer

#### BaseCrop
Abstract base class providing common functionality:

**State Management**:
- Initializes all ICrop properties
- Ensures stage starts at 1
- Sets up timestamps

**Helper Methods**:
- `getStageTime()`: Calculate time required for current stage
- `isMature()`: Check if at final stage
- `getVisualProperties()`: Retrieve current stage visuals

**Serialization**:
- `toJSON()`: Convert to saveable format
- `fromJSON()`: Restore from saved data

**Key Design Decision**: The constructor accepts a `CropConfig` parameter, allowing the base class to access configuration during initialization. This avoids issues with accessing abstract properties before child class initialization.

#### OatCrop
Concrete implementation for oats:
- Passes `oatConfig` to base constructor
- Provides factory method `fromSaveData()` for deserialization
- Can be extended with oat-specific methods if needed

### Type Layer

#### Common Types
Shared type definitions used across the system:

**Enums**:
- `GrowthStage`: Named constants for stages
- `Orientation`: Visual orientation (UPRIGHT, DROOPING)
- `PlantFailureReason`: Why planting failed
- `CropEventType`: Types of crop events

**Result Types**:
- `PlantResult`: Success/failure with reason
- `PurchaseResult`: Transaction outcome
- `ValidationResult`: Condition check result

**Event Types**:
- `CropEvent`: Base event structure
- `HarvestEvent`: Harvest-specific event

**Utility Types**:
- `Color`: RGB representation
- `ItemDrop`: Item quantity pairs
- `hexToRgb()`: Color conversion utility

## Extensibility

### Adding a New Crop Type

To add wheat, corn, tomatoes, or any other crop:

1. **Create Configuration**:
```typescript
export class WheatSystemConfig implements CropConfig {
  baseGrowthTime = 432000; // 5 days
  stageCount = 7;
  // ... define all wheat-specific values
  stageVisuals = [
    { stage: 1, color: '#...' height: 0.1 },
    // ... 7 stages total
  ];
}
export const wheatConfig = new WheatSystemConfig();
```

2. **Create Crop Class**:
```typescript
export class WheatCrop extends BaseCrop {
  constructor(id: string, position: BlockPosition) {
    super(id, position, wheatConfig);
  }
  
  static fromSaveData(data: any): WheatCrop {
    const crop = new WheatCrop(data.id, data.position);
    crop.fromJSON(data);
    return crop;
  }
}
```

3. **Implement Specialized Components** (if needed):
If wheat has unique behavior not covered by the generic system:
```typescript
export class WheatYieldCalculator implements ICropYield<WheatCrop> {
  calculateYield(crop: WheatCrop, fortuneLevel: number): HarvestYield {
    // Wheat-specific yield logic
  }
}
```

4. **Register in System** (future task):
```typescript
cropRegistry.register('wheat', {
  cropClass: WheatCrop,
  config: wheatConfig,
  // optional specialized components
});
```

### Customization Points

The system provides multiple levels of customization:

**Level 1: Configuration Only**
- Most crops can be implemented by just providing a config
- No code changes needed, just parameter values

**Level 2: Override Methods**
- Override specific methods in the crop class
- Example: Custom visual effects, special growth rules

**Level 3: Custom Components**
- Implement custom growth engines, yield calculators, etc.
- Full control over behavior while maintaining interfaces

## Data Flow

### Planting Flow
```
User plants seed
  → Validate soil (ConditionValidator)
  → Validate biome (BiomeManager)
  → Create crop instance (new OatCrop)
  → Initialize at stage 1
  → Add to world
  → Render initial visual
```

### Growth Flow
```
Game tick
  → For each crop:
    → Check conditions (light, space)
    → Calculate bonuses (water, rain)
    → Calculate progress (deltaTime × bonuses)
    → Add to stageProgress
    → If stageProgress >= stageTime:
      → Advance to next stage
      → Reset stageProgress
      → Update visuals
    → If at max stage: stop progression
```

### Harvest Flow
```
User harvests crop
  → Get crop stage
  → Calculate yield (YieldCalculator)
  → Apply Fortune if present
  → Generate items
  → Remove crop from world
  → Add items to inventory
```

### Persistence Flow
```
Chunk unload
  → For each crop in chunk:
    → Call crop.toJSON()
    → Save to chunk data
    
Chunk load
  → For each saved crop:
    → Call OatCrop.fromSaveData()
    → Restore state
    → Resume growth from saved progress
```

## Testing Strategy

### Unit Tests
- Verify specific examples and edge cases
- Test configuration values
- Test state transitions
- Test error conditions

### Property-Based Tests
- Verify universal properties across random inputs
- Use fast-check for generation
- Minimum 100 iterations per property
- Tag format: `Feature: hytale-oats-farming, Property {N}: {description}`

### Integration Tests
- Test complete workflows (plant → grow → harvest)
- Test persistence (save → load → verify)
- Test environmental interactions

## Performance Considerations

### Optimization Strategies
1. **Spatial Indexing**: Crops stored by chunk for efficient updates
2. **Lazy Evaluation**: Only update crops in loaded chunks
3. **Batch Processing**: Update multiple crops per tick
4. **Caching**: Cache frequently accessed values (stage time, visuals)

### Performance Targets
- 80 crops: < 1ms per tick
- 1000 crops: < 10ms per tick
- Chunk load (100 crops): < 50ms
- Chunk save (100 crops): < 30ms

## Future Enhancements

### Planned Features
1. **Crop Registry**: Central registration system for all crop types
2. **Growth Modifiers**: Fertilizers, soil quality, temperature
3. **Crop Diseases**: Blight, pests, weather damage
4. **Cross-Breeding**: Combine crops for new varieties
5. **Automation**: Crop-specific automation systems
6. **Seasons**: Seasonal growth modifiers
7. **Quality Tiers**: Normal, silver, gold quality crops

### Extension Points
- Custom validators for special conditions
- Custom renderers for unique visual effects
- Custom acquisition methods (trading, quests)
- Custom particle systems
- Custom sound effects

## Conclusion

This architecture provides a solid foundation for a comprehensive farming system. The generic design ensures that adding new crops is straightforward, while the configuration-driven approach allows for extensive customization without code changes. The use of TypeScript's type system provides compile-time safety, and the comprehensive testing strategy ensures correctness.
