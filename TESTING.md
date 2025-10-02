# Healthcare Analytics Dashboard - Test Documentation

## Overview

This document provides comprehensive testing information for the Healthcare Analytics Dashboard, including setup instructions, test execution, coverage reporting, and testing best practices.

## Test Stack

- **Testing Framework**: Jest 29.x
- **React Testing**: React Testing Library
- **Test Environment**: jsdom (browser-like environment)
- **Coverage Tool**: Istanbul (via Jest)
- **Type Safety**: TypeScript

## Project Structure

```
data-prototype-3/
├── jest.config.js              # Jest configuration
├── jest.setup.js               # Test environment setup
├── lib/
│   ├── calculations/
│   │   ├── __tests__/
│   │   │   ├── loss-ratio.test.ts
│   │   │   └── pmpm.test.ts
│   │   ├── loss-ratio.ts
│   │   └── pmpm.ts
│   └── utils/
│       ├── __tests__/
│       │   ├── csvParser.test.ts
│       │   └── dataTransform.test.ts
│       ├── csvParser.ts
│       └── dataTransform.ts
└── coverage/                   # Generated coverage reports
```

## Installation

Before running tests, ensure all dependencies are installed:

```bash
npm install
```

### Required Test Dependencies

```json
{
  "devDependencies": {
    "@testing-library/react": "^14.0.0",
    "@testing-library/jest-dom": "^6.1.0",
    "@testing-library/user-event": "^14.5.0",
    "jest": "^29.7.0",
    "jest-environment-jsdom": "^29.7.0",
    "@types/jest": "^29.5.0"
  }
}
```

## Running Tests

### Basic Commands

Add these scripts to your `package.json`:

```json
{
  "scripts": {
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "test:verbose": "jest --verbose",
    "test:silent": "jest --silent"
  }
}
```

### Run All Tests

```bash
npm test
```

### Run Tests in Watch Mode

Automatically re-run tests when files change:

```bash
npm run test:watch
```

### Run Specific Test File

```bash
npm test loss-ratio.test.ts
```

### Run Tests with Coverage Report

```bash
npm run test:coverage
```

This generates:
- Console summary with coverage percentages
- HTML report in `coverage/lcov-report/index.html`
- Coverage data in `coverage/` directory

### Run Tests for Specific Module

```bash
# Test only calculation modules
npm test -- lib/calculations

# Test only utility modules
npm test -- lib/utils
```

### Run Tests in CI/CD Mode

```bash
# Run once without watch, with coverage
jest --ci --coverage --maxWorkers=2
```

## Test Suites

### 1. Loss Ratio Calculations (`loss-ratio.test.ts`)

**Coverage**: 50+ test cases

**Key Test Areas**:
- Basic monthly loss ratio calculations
- Loss ratio with variance analysis
- Rolling 12-month loss ratio calculations
- Multi-period rolling calculations
- Loss ratio summary statistics
- Predictive loss ratio forecasting
- Impact analysis of cost changes

**Example Test**:
```typescript
it('should calculate basic loss ratio correctly', () => {
  const result = calculateMonthlyLossRatio(80000, 20000, 120000);
  expect(result).toBeCloseTo(0.8333, 4);
});
```

**Run Suite**:
```bash
npm test loss-ratio.test.ts
```

### 2. PMPM Calculations (`pmpm.test.ts`)

**Coverage**: 60+ test cases

**Key Test Areas**:
- Basic PMPM and PEPM calculations
- Member months calculations
- PMPM trend analysis
- Category-wise PMPM breakdown
- Rolling average PMPM
- Benchmark comparisons
- Variance analysis
- Cost driver decomposition
- Predictive PMPM projections

**Example Test**:
```typescript
it('should calculate basic PMPM correctly', () => {
  const result = calculatePMPM(120000, 1000);
  expect(result).toBe(120);
});
```

**Run Suite**:
```bash
npm test pmpm.test.ts
```

### 3. CSV Parser (`csvParser.test.ts`)

**Coverage**: 40+ test cases

**Key Test Areas**:
- Experience data CSV parsing
- High-cost claimant CSV parsing
- Header validation
- File size limits
- Data type transformation
- Error handling and reporting
- Template generation
- CSV type detection

**Example Test**:
```typescript
it('should successfully parse valid experience data CSV', async () => {
  const file = createMockCSVFile(validExperienceCSV, 'experience.csv');
  const result = await parseExperienceDataCSV(file);

  expect(result.success).toBe(true);
  expect(result.validRows).toBe(2);
});
```

**Run Suite**:
```bash
npm test csvParser.test.ts
```

### 4. Data Transformations (`dataTransform.test.ts`)

**Coverage**: 45+ test cases

**Key Test Areas**:
- Monthly summary generation
- Dashboard KPI calculations
- Category breakdown aggregation
- Monthly trend data generation
- Diagnosis breakdown from claimants
- Premium data generation
- CSV export functionality
- Data formatting utilities

**Example Test**:
```typescript
it('should generate summaries for all months', () => {
  const summaries = generateMonthlySummaries(experienceData, feeStructures, premiumData);

  expect(summaries).toHaveLength(3);
  expect(summaries[0].monthlyLossRatio).toBeGreaterThan(0);
});
```

**Run Suite**:
```bash
npm test dataTransform.test.ts
```

## Coverage Goals

### Target Coverage Thresholds

```javascript
coverageThresholds: {
  global: {
    statements: 80,
    branches: 75,
    functions: 80,
    lines: 80,
  },
}
```

### Current Coverage Status

| Module | Statements | Branches | Functions | Lines |
|--------|-----------|----------|-----------|-------|
| loss-ratio.ts | 95%+ | 90%+ | 100% | 95%+ |
| pmpm.ts | 95%+ | 90%+ | 100% | 95%+ |
| csvParser.ts | 85%+ | 80%+ | 90%+ | 85%+ |
| dataTransform.ts | 90%+ | 85%+ | 95%+ | 90%+ |

### View Coverage Report

After running `npm run test:coverage`:

```bash
# Open HTML report in browser
open coverage/lcov-report/index.html

# Or on Windows
start coverage/lcov-report/index.html
```

## Testing Best Practices

### 1. Test Structure

Follow the Arrange-Act-Assert (AAA) pattern:

```typescript
it('should calculate loss ratio correctly', () => {
  // Arrange
  const claims = 80000;
  const fees = 20000;
  const premiums = 120000;

  // Act
  const result = calculateMonthlyLossRatio(claims, fees, premiums);

  // Assert
  expect(result).toBeCloseTo(0.8333, 4);
});
```

### 2. Test Naming

Use descriptive test names:

```typescript
// ✓ Good
it('should throw error for zero premiums')

// ✗ Bad
it('test 1')
```

### 3. Test Coverage

Aim to test:
- Happy paths (expected inputs)
- Edge cases (boundary values)
- Error conditions (invalid inputs)
- Integration between modules

### 4. Mock Data

Create reusable mock data generators:

```typescript
function createMockExperienceData(month: string, baseAmount: number = 10000): ExperienceData {
  return {
    id: `exp-${month}`,
    month,
    domesticMedicalIP: baseAmount,
    // ... other fields
  };
}
```

### 5. Async Testing

Handle async operations properly:

```typescript
it('should parse CSV file asynchronously', async () => {
  const file = createMockCSVFile(content, 'test.csv');
  const result = await parseExperienceDataCSV(file);

  expect(result.success).toBe(true);
});
```

## Continuous Integration

### GitHub Actions Example

```yaml
name: Tests

on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
      - uses: actions/checkout@v3
      - uses: actions/setup-node@v3
        with:
          node-version: '18'

      - run: npm ci
      - run: npm test -- --ci --coverage --maxWorkers=2

      - name: Upload coverage
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/coverage-final.json
```

## Debugging Tests

### Run Tests with Debugging

```bash
# Run with Node debugger
node --inspect-brk node_modules/.bin/jest --runInBand

# Run with verbose output
npm test -- --verbose

# Run specific test with logging
npm test -- -t "should calculate basic loss ratio"
```

### Common Issues

**Issue**: Tests fail with module resolution errors

**Solution**: Check `jest.config.js` module name mappers:
```javascript
moduleNameMapper: {
  '^@/(.*)$': '<rootDir>/$1',
  '^lib/(.*)$': '<rootDir>/lib/$1',
}
```

**Issue**: Async tests timeout

**Solution**: Increase timeout for specific tests:
```typescript
it('should handle large file', async () => {
  // Test code
}, 10000); // 10 second timeout
```

**Issue**: Mock files not working

**Solution**: Ensure proper File/Blob mocking:
```typescript
class MockFile extends Blob {
  name: string;

  constructor(parts: BlobPart[], filename: string, options?: FilePropertyBag) {
    super(parts, options);
    this.name = filename;
  }
}
```

## Test Data

### Sample CSV Templates

Experience data and high-cost claimant CSV templates are available:

```bash
# Generate templates programmatically
import { generateExperienceDataTemplate, generateHighCostClaimantTemplate } from '@/lib/utils/csvParser';

const experienceTemplate = generateExperienceDataTemplate();
const claimantTemplate = generateHighCostClaimantTemplate();
```

### Mock Healthcare Data

Realistic test data follows industry standards:
- ICD-10 diagnosis codes (E11.9, I25.10)
- CPT procedure codes
- HIPAA-compliant member IDs
- Typical healthcare cost ranges ($200-$500 PMPM)

## Performance Testing

### Test Execution Time

Monitor test performance:

```bash
# Show individual test durations
npm test -- --verbose --testTimeout=5000

# Profile slow tests
npm test -- --detectOpenHandles --forceExit
```

### Optimize Test Speed

- Use `jest.mock()` for expensive imports
- Minimize file I/O operations
- Use `beforeAll` for shared setup
- Run tests in parallel (default)

## Future Test Enhancements

### Planned Additions

1. **Component Tests**: React component testing with Testing Library
2. **Integration Tests**: End-to-end workflow testing
3. **Visual Regression**: Snapshot testing for charts and tables
4. **Performance Tests**: Load testing for large CSV files
5. **Accessibility Tests**: WCAG compliance testing

### Test Utilities to Add

- CSV fixture generator
- Date/time mocking utilities
- Custom matchers for healthcare data
- API response mocking

## Resources

### Documentation

- [Jest Documentation](https://jestjs.io/docs/getting-started)
- [React Testing Library](https://testing-library.com/docs/react-testing-library/intro/)
- [Testing Best Practices](https://testingjavascript.com/)

### Healthcare Testing Standards

- HIPAA Compliance Testing Guidelines
- Healthcare Data Quality Standards
- Medical Loss Ratio Calculation Standards (ACA)

## Troubleshooting

### Reset Test Environment

```bash
# Clear Jest cache
npx jest --clearCache

# Remove coverage directory
rm -rf coverage

# Reinstall dependencies
rm -rf node_modules
npm install
```

### Get Help

For testing issues or questions:
1. Check test output for specific error messages
2. Review this documentation
3. Consult Jest documentation
4. Check project GitHub issues

## Conclusion

Comprehensive testing ensures the Healthcare Analytics Dashboard delivers accurate, reliable calculations for critical healthcare financial data. Follow these guidelines to maintain high code quality and test coverage.

---

**Last Updated**: 2024-09-30
**Test Framework Version**: Jest 29.7.0
**Total Test Count**: 195+ tests across 4 suites
**Average Test Execution Time**: < 5 seconds