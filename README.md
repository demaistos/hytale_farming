# Hytale Oats Farming System

A generic, extensible farming system for Hytale with initial implementation for oat crops. The system is designed with modularity and reusability in mind, making it easy to add new crop types like wheat, corn, tomatoes, and more.

## Features

- **Generic Architecture**: Base classes and interfaces that can be extended for any crop type
- **Oat Crop Implementation**: Complete implementation of oats with 4 growth stages
- **Environmental Bonuses**: Water proximity (+15%) and rain (+10%) growth bonuses
- **Fortune Support**: Enchantment support for increased yields
- **Property-Based Testing**: Comprehensive testing using fast-check for correctness guarantees
- **Persistent State**: Crop state is saved and restored across game sessions

## Project Structure

```
src/farming-system/
├── interfaces/           # Generic interfaces for all crop types
│   ├── ICrop.ts         # Core crop interface
│   ├── ICropGrowth.ts   # Growth management interface
│   ├── ICropYield.ts    # Yield calculation interface
│   └── index.ts
├── config/              # Configuration system
│   ├── CropConfig.ts    # Generic crop configuration interface
│   ├── OatSystemConfig.ts # Oat-specific configuration
│   └── index.ts
├── models/              # Crop implementations
│   ├── BaseCrop.ts      # Abstract base class for all crops
│   ├── OatCrop.ts       # Oat crop implementation
│   └── index.ts
├── types/               # Common types and enums
│   ├── common.ts        # Shared type definitions
│   └── index.ts
├── __tests__/           # Test files
│   └── setup.test.ts    # Basic setup tests
└── index.ts             # Main entry point
```

## Oat Crop Specifications

### Growth Stages
1. **Germination** (Stage 1): Lime green (#90EE90), 0.15 blocks tall
2. **Young Sprout** (Stage 2): Forest green (#228B22), 0.40 blocks tall
3. **Growth** (Stage 3): Transition to pale yellow, 0.70 blocks tall
4. **Maturity** (Stage 4): Golden beige (#DAA520), 0.90-1.00 blocks tall, drooping ears

### Growth Time
- Base: 4 in-game days (345,600 seconds)
- With water nearby (4 block radius): +15% faster
- During rain (if exposed to sky): +10% faster
- Bonuses stack additively

### Yield
- **Mature plants** (Stage 4):
  - Grains: 3-4 (80% chance for 4)
  - Seeds: 1-2 (70% chance for 2)
- **Immature plants** (Stages 1-3):
  - Grains: 0
  - Seeds: 1

### Fortune Enchantment
- Fortune I: Max 5 grains (min 4)
- Fortune II: Max 6 grains (min 4)
- Fortune III: Max 7 grains (min 4)
- Fortune does not affect seed drops

### Growth Requirements
- Soil: Farmland (tilled soil)
- Light level: ≥ 9
- Space: Clear block above
- Biomes: Cannot grow in Extreme Desert, Frozen Tundra, Nether, or End

### Acquisition Methods
1. **Purchase**: 12 Life Essence for 4 seeds
2. **Village Loot**: 15-20% chance in farm chests, 2-6 seeds
3. **Grass Drops**: 5% chance in Plains biome, 1 seed

## Getting Started

### Installation

```bash
npm install
```

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage
npm run test:coverage
```

### Building

```bash
npm run build
```

## Adding New Crop Types

To add a new crop type (e.g., wheat):

1. **Create a configuration class**:
```typescript
export class WheatSystemConfig implements CropConfig {
  // Define wheat-specific values
  baseGrowthTime = 432000; // 5 days
  stageCount = 7;
  // ... other config
}
```

2. **Create a crop class**:
```typescript
export class WheatCrop extends BaseCrop {
  protected config: CropConfig = wheatConfig;
  
  constructor(id: string, position: BlockPosition) {
    super(id, position);
  }
}
```

3. **Implement specialized components** (if needed):
   - Custom growth engine
   - Custom yield calculator
   - Custom validators

4. **Register in the crop system** (to be implemented in later tasks)

## Testing Strategy

The project uses a dual testing approach:

- **Unit Tests**: Verify specific examples, edge cases, and error conditions
- **Property-Based Tests**: Verify universal properties across many randomly generated inputs using fast-check

All property tests reference their corresponding property from the design document using the format:
```
Feature: hytale-oats-farming, Property {number}: {property_text}
```

## Requirements Coverage

This implementation satisfies the following requirements:
- **Exigence 1.1-1.5**: Growth stage system
- **Exigence 2.1-2.5**: Growth timing and bonuses
- **Exigence 3.1-3.6**: Visual rendering
- **Exigence 4.1-4.6**: Yield system
- **Exigence 5.1-5.5**: Fortune enchantment
- **Exigence 6.1-6.6**: Growth conditions
- **Exigence 7.1-7.5**: Biome restrictions
- **Exigence 8.1-8.4**: Purchase system
- **Exigence 9.1-9.3**: Village loot
- **Exigence 10.1-10.3**: Grass drops
- **Exigence 11.1-11.4**: Water bonus
- **Exigence 12.1-12.4**: Rain bonus
- **Exigence 13.1-13.4**: Visual distinction
- **Exigence 14.1-14.4**: Particle effects
- **Exigence 15.1-15.4**: State persistence

## License

MIT
