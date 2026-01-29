# Task 3.2 Summary: Property-Based Test for Soil Validation

## Overview

Task 3.2 implements comprehensive property-based testing for **Property 17: Validation du Sol** using the fast-check library. This ensures that soil validation works correctly across all possible inputs and scenarios.

## Property 17: Validation du Sol

**Statement**: For any planting attempt, if the block below is not Terre_Labourée (tilled soil), planting must fail.

**Validates Requirements**:
- **6.1**: When an oat seed is planted, the validator must verify that the block below is tilled soil
- **6.2**: When an oat seed is planted on an invalid block, the system must prevent planting

## Implementation Details

### File Created
- `src/farming-system/__tests__/task-3.2-soil-validation-property.test.ts`

### Test Coverage

The property-based test suite includes 5 comprehensive tests, each running 100 iterations:

#### 1. **Negative Case: Invalid Soil Types**
- **Property**: For any position and invalid soil type, planting must fail
- **Generators**: 
  - Random positions (x: -1000 to 1000, y: 1 to 254, z: -1000 to 1000)
  - Invalid soil types (dirt, stone, sand, gravel, grass_block, cobblestone, wood, air, water, lava)
- **Assertion**: `result.valid === false` and reason contains "soil"
- **Iterations**: 100

#### 2. **Positive Case: Valid Soil Types**
- **Property**: For any position and valid soil type, soil validation must pass
- **Generators**:
  - Random positions (same range as above)
  - Valid soil types (FARMLAND, TILLED_SOIL)
- **Assertion**: `result.valid === true` and no reason provided
- **Iterations**: 100

#### 3. **Position Check: Block Below**
- **Property**: Validator must check the block at y-1, not y
- **Test Strategy**: 
  - Set valid soil at y-1, verify planting succeeds
  - Set invalid soil at y-1, verify planting fails
- **Assertion**: Validates that the correct position (y-1) is being checked
- **Iterations**: 100

#### 4. **Case Sensitivity**
- **Property**: Only exact case matches should be accepted
- **Generators**:
  - Random positions
  - Case variations (farmland, Farmland, FarmLand, tilled_soil, Tilled_Soil, TILLED_soil)
- **Assertion**: All case variations must fail validation
- **Iterations**: 100

#### 5. **Coordinate Independence**
- **Property**: Validation should work consistently at any coordinate
- **Generators**:
  - Extreme coordinates (x/z: -30,000,000 to 30,000,000)
  - Tests both valid and invalid soil at extreme positions
- **Assertion**: Validation logic is independent of coordinate values
- **Iterations**: 100

## Test Results

All tests pass successfully:
```
✓ should reject planting when soil is not tilled (Property 17) (13 ms)
✓ should accept planting when soil is tilled (Property 17 - positive case) (6 ms)
✓ should check the block below the planting position (Property 17 - position check) (7 ms)
✓ should be case-sensitive for soil type validation (Property 17 - case sensitivity) (6 ms)
✓ should validate soil consistently across all coordinates (Property 17 - coordinate independence) (8 ms)
```

**Total Iterations**: 500 (5 tests × 100 iterations each)

## Key Design Decisions

### 1. Comprehensive Coverage
The test suite covers:
- Both positive and negative cases
- Edge cases (position checking, case sensitivity)
- Extreme values (coordinate independence)
- Multiple invalid soil types

### 2. Smart Generators
- **Position Generator**: Constrains y to 1-254 to ensure there's always a block below
- **Invalid Soil Generator**: Uses `fc.oneof()` to test common block types
- **Valid Soil Generator**: Tests both FARMLAND and TILLED_SOIL
- **Case Variation Generator**: Tests realistic case mistakes

### 3. Clear Test Structure
Each test follows the Arrange-Act-Assert pattern:
```typescript
// Arrange: Set up world with specific conditions
const world = new MockWorld();
const validator = new OatConditionValidator(oatConfig, world);
world.setBlock(soilPosition, soilType);

// Act: Check if planting is allowed
const result = validator.canPlant(position);

// Assert: Verify expected behavior
expect(result.valid).toBe(expectedValue);
```

### 4. Minimum 100 Iterations
As specified in the requirements, all property tests run with `{ numRuns: 100 }` to ensure thorough coverage despite the randomization.

## Integration with Existing System

The property-based tests complement the existing unit tests from Task 3.1:
- **Unit tests** (Task 3.1): Test specific examples and known edge cases
- **Property tests** (Task 3.2): Test universal properties across random inputs

Together, they provide comprehensive validation coverage:
- Unit tests: 33 tests covering specific scenarios
- Property tests: 5 tests with 500 total iterations

## Validation Against Requirements

### Requirement 6.1 ✅
**"When an oat seed is planted, the validator must verify that the block below is tilled soil"**

Validated by:
- Positive case test: Verifies FARMLAND and TILLED_SOIL are accepted
- Position check test: Verifies the block at y-1 is checked

### Requirement 6.2 ✅
**"When an oat seed is planted on an invalid block, the system must prevent planting"**

Validated by:
- Negative case test: Verifies 10 different invalid soil types are rejected
- Case sensitivity test: Verifies incorrect case variations are rejected
- Coordinate independence test: Verifies rejection works at all coordinates

## Benefits of Property-Based Testing

1. **Exhaustive Coverage**: Tests 500 random scenarios instead of a few hand-picked examples
2. **Edge Case Discovery**: Automatically finds edge cases we might not think of
3. **Regression Prevention**: Ensures the property holds even as code evolves
4. **Documentation**: Properties serve as executable specifications
5. **Confidence**: High confidence that the validation works for ALL inputs, not just tested examples

## Next Steps

Task 3.3 will implement the growth condition validation (light level and space checking), followed by Task 3.4 which will add property-based tests for Properties 18 and 19.

## Test Statistics

- **Total Tests**: 5 property-based tests
- **Total Iterations**: 500 (100 per test)
- **Execution Time**: ~40ms total
- **Pass Rate**: 100%
- **Coverage**: Property 17 fully validated

## Conclusion

Task 3.2 successfully implements comprehensive property-based testing for soil validation, ensuring that Property 17 holds universally across all possible inputs. The tests provide high confidence that the soil validation logic is correct and will remain correct as the system evolves.
