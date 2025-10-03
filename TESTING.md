# Testing Guide

This document provides a comprehensive guide to the test suite for the Higher Endeavors application.

## Overview

The test suite is built using:
- **Jest** - JavaScript testing framework
- **React Testing Library** - React component testing utilities
- **@testing-library/jest-dom** - Custom Jest matchers for DOM testing

## Test Structure

```
src/
├── app/
│   ├── __tests__/
│   │   ├── integration/          # Integration tests
│   │   ├── test-utils.tsx        # Test utilities and helpers
│   │   └── page.test.tsx         # Page component tests
│   ├── components/
│   │   └── __tests__/            # Component tests
│   ├── lib/
│   │   ├── __tests__/            # Utility function tests
│   │   └── hooks/
│   │       └── __tests__/        # Custom hook tests
│   └── api/
│       └── __tests__/            # API route tests
```

## Running Tests

### Basic Commands

```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage report
pnpm test:coverage

# Run tests for CI/CD
pnpm test:ci
```

### Running Specific Tests

```bash
# Run tests for a specific file
pnpm test Header.test.tsx

# Run tests matching a pattern
pnpm test --testNamePattern="renders without crashing"

# Run tests in a specific directory
pnpm test src/app/components/__tests__/
```

## Test Categories

### 1. Component Tests

Located in `src/app/components/__tests__/`

**Purpose**: Test individual React components in isolation

**Examples**:
- `Header.test.tsx` - Tests the main header component
- `DropdownMenu.test.tsx` - Tests the user dropdown menu
- `UserSidebar.test.tsx` - Tests the sidebar navigation

**Key Testing Areas**:
- Component rendering
- User interactions (clicks, hovers, form inputs)
- Props handling
- State management
- Accessibility features

### 2. Utility Function Tests

Located in `src/app/lib/__tests__/` and `src/app/lib/hooks/__tests__/`

**Purpose**: Test pure functions and custom hooks

**Examples**:
- `apiUtils.test.ts` - Tests API utility functions
- `use-error-boundary.test.ts` - Tests error boundary hook
- `toast.test.tsx` - Tests toast notification system

**Key Testing Areas**:
- Function return values
- Error handling
- Edge cases
- Hook behavior and side effects

### 3. API Route Tests

Located in `src/app/api/__tests__/`

**Purpose**: Test API endpoints and their responses

**Examples**:
- `tier-continuum.test.ts` - Tests tier continuum API
- `users.test.ts` - Tests user management API
- `exercises.test.ts` - Tests exercise data API

**Key Testing Areas**:
- HTTP method handling (GET, POST, PUT, DELETE)
- Request validation
- Response formatting
- Error handling
- Authentication and authorization

### 4. Integration Tests

Located in `src/app/__tests__/integration/`

**Purpose**: Test complete user flows and component interactions

**Examples**:
- `user-authentication.test.tsx` - Tests authentication flow
- `sidebar-navigation.test.tsx` - Tests navigation interactions

**Key Testing Areas**:
- Multi-component interactions
- User workflows
- State management across components
- API integration

## Test Utilities

### Custom Render Function

The `test-utils.tsx` file provides a custom render function that includes necessary providers:

```tsx
import { renderWithProviders } from '../__tests__/test-utils';

test('renders with session', () => {
  renderWithProviders(<MyComponent />, {
    session: mockSession,
  });
});
```

### Mock Data

Pre-defined mock data for consistent testing:

```tsx
import { mockSession, mockApiResponses } from '../__tests__/test-utils';

// Use mock session data
const session = mockSession;

// Use mock API responses
const exercises = mockApiResponses.exercises;
```

### Helper Functions

- `mockFetchResponse()` - Mock fetch API responses
- `mockDatabaseResponse()` - Mock database query responses
- `createMockRequest()` - Create mock request objects

## Configuration

### Jest Configuration

The Jest configuration is defined in `jest.config.ts`:

- **Test Environment**: jsdom (for React components)
- **Coverage Threshold**: 70% for branches, functions, lines, and statements
- **Module Mapping**: Path aliases for `@/` imports
- **Setup Files**: `jest.setup.ts` for global test configuration

### Setup Files

`jest.setup.ts` includes:
- Global mocks for Next.js modules
- Environment variable setup
- Browser API mocks (matchMedia, IntersectionObserver, etc.)

## Best Practices

### 1. Test Structure

Follow the AAA pattern:
- **Arrange**: Set up test data and mocks
- **Act**: Execute the function or interaction
- **Assert**: Verify the expected outcome

```tsx
test('should display user name', () => {
  // Arrange
  const user = { name: 'John Doe' };
  
  // Act
  render(<UserProfile user={user} />);
  
  // Assert
  expect(screen.getByText('John Doe')).toBeInTheDocument();
});
```

### 2. Mocking Strategy

- Mock external dependencies (APIs, databases, third-party libraries)
- Use real implementations for internal utilities when possible
- Mock at the module level, not individual functions

### 3. Accessibility Testing

Always test accessibility features:

```tsx
test('has proper accessibility attributes', () => {
  render(<Button>Click me</Button>);
  
  const button = screen.getByRole('button');
  expect(button).toHaveAttribute('aria-label');
  expect(button).toBeInTheDocument();
});
```

### 4. Async Testing

Handle async operations properly:

```tsx
test('loads data on mount', async () => {
  render(<DataComponent />);
  
  await waitFor(() => {
    expect(screen.getByText('Data loaded')).toBeInTheDocument();
  });
});
```

## Coverage Reports

Coverage reports are generated in the `coverage/` directory:

- **HTML Report**: `coverage/lcov-report/index.html`
- **JSON Report**: `coverage/coverage-final.json`
- **LCOV Report**: `coverage/lcov.info`

### Coverage Thresholds

The project maintains 70% coverage for:
- Branches
- Functions
- Lines
- Statements

## Debugging Tests

### Common Issues

1. **Module Resolution**: Ensure path aliases are correctly configured
2. **Async Operations**: Use `waitFor` for async state changes
3. **Mock Cleanup**: Clear mocks between tests with `jest.clearAllMocks()`

### Debug Commands

```bash
# Run tests with verbose output
pnpm test --verbose

# Run tests with debug information
pnpm test --detectOpenHandles

# Run a single test file with debug
pnpm test --testPathPattern=Header.test.tsx --verbose
```

## Continuous Integration

The test suite is designed to run in CI/CD environments:

```bash
# CI command
pnpm test:ci
```

This command:
- Runs tests without watch mode
- Generates coverage reports
- Exits with appropriate status codes
- Runs in non-interactive mode

## Contributing

When adding new tests:

1. Follow the existing naming conventions (`*.test.tsx` or `*.test.ts`)
2. Place tests in the appropriate directory structure
3. Use the provided test utilities and mock data
4. Ensure tests are isolated and don't depend on external state
5. Add tests for both happy path and error scenarios
6. Update this documentation if adding new test categories or utilities
