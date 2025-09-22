# Testing Structure

This directory contains the centralized test suite for the Higher Endeavors application, organized according to best practices for large Next.js codebases.

## Directory Structure

```
tests/
├── unit/                    # Unit tests
│   ├── components/         # React component tests
│   ├── hooks/             # Custom hook tests
│   ├── utils/             # Utility function tests
│   ├── api/               # API route tests
│   └── pages/             # Page component tests
├── integration/           # Integration tests
├── __fixtures__/          # Mock data and test fixtures
├── __mocks__/             # Module mocks
├── utils/                 # Test utilities and helpers
└── setup/                 # Test setup and configuration

__tests__/                 # Alternative test location (Jest default)
├── unit/                  # Unit tests (mirror of tests/unit)
├── integration/           # Integration tests (mirror of tests/integration)
└── e2e/                   # E2E tests (mirror of e2e/)

e2e/                       # End-to-end tests (Playwright)
├── specs/                 # E2E test specifications
├── fixtures/              # E2E test data
└── config/                # E2E configuration
```

## Test Types

### Unit Tests (`tests/unit/`)
- **Components**: Test individual React components in isolation
- **Hooks**: Test custom hooks with `@testing-library/react-hooks`
- **Utils**: Test utility functions and pure functions
- **API**: Test API routes with mocked dependencies
- **Pages**: Test page components and their rendering

### Integration Tests (`tests/integration/`)
- Test interactions between multiple components
- Test user flows that span multiple pages
- Test API integration with components

### End-to-End Tests (`e2e/`)
- Test complete user journeys
- Test real browser interactions
- Test production-like scenarios

## Running Tests

```bash
# Run all tests
pnpm test

# Run specific test types
pnpm test:unit              # Unit tests only
pnpm test:integration       # Integration tests only
pnpm test:e2e              # E2E tests only
pnpm test:all              # All test types

# Run with watch mode
pnpm test:watch

# Run with coverage
pnpm test:coverage

# Run E2E tests with UI
pnpm test:e2e:ui
```

## Test Utilities

### `tests/utils/test-utils.tsx`
- Custom render function with providers
- Re-exports from `@testing-library/react`
- Mock session data

### `tests/__fixtures__/`
- `user-data.ts`: Mock user and session data
- `api-responses.ts`: Mock API response data

### `tests/__mocks__/`
- `next-navigation.ts`: Mock Next.js navigation hooks
- `next-auth.ts`: Mock Next.js auth functions

## Best Practices

1. **Test Organization**: Group tests by feature/domain when the codebase grows large
2. **Naming Convention**: Use `ComponentName.test.tsx` for component tests
3. **Path Aliases**: Use `@tests/`, `@fixtures/`, `@mocks/` for imports
4. **Mock Management**: Centralize mocks in `__mocks__/` directory
5. **Test Data**: Use fixtures for consistent test data
6. **Coverage**: Maintain reasonable coverage thresholds (20% minimum)

## Configuration

- **Jest**: Configured in `jest.config.ts`
- **Playwright**: Configured in `playwright.config.ts`
- **Setup**: Centralized in `tests/setup/test-setup.ts`

## Adding New Tests

1. **Unit Tests**: Add to appropriate subdirectory in `tests/unit/`
2. **Integration Tests**: Add to `tests/integration/`
3. **E2E Tests**: Add to `e2e/specs/`
4. **Fixtures**: Add mock data to `tests/__fixtures__/`
5. **Mocks**: Add module mocks to `tests/__mocks__/`

## CI/CD Integration

The test structure supports:
- Parallel test execution
- Separate CI jobs for different test types
- Coverage reporting
- Test result aggregation
