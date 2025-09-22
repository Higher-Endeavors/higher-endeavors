// Centralized test setup for the new structure
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/navigation', () => ({
  useRouter() {
    return {
      push: jest.fn(),
      replace: jest.fn(),
      prefetch: jest.fn(),
      back: jest.fn(),
      forward: jest.fn(),
      refresh: jest.fn(),
    };
  },
  useSearchParams() {
    return new URLSearchParams();
  },
  usePathname() {
    return '/';
  },
  useParams() {
    return {};
  },
}));

// Mock Next.js headers
jest.mock('next/headers', () => ({
  headers: jest.fn(() => ({
    get: jest.fn(() => 'localhost:3000'),
  })),
}));

// Mock Next.js server components
jest.mock('next/server', () => ({
  NextRequest: class MockNextRequest {
    constructor(public url: string) {}
  },
  NextResponse: {
    json: jest.fn((data, init) => ({
      json: () => Promise.resolve(data),
      status: init?.status || 200,
    })),
  },
}));

// Mock styled-jsx
jest.mock('styled-jsx', () => {
  const React = require('react');
  return {
    default: React.createElement,
    jsx: () => React.createElement,
    css: () => '',
    global: () => React.createElement,
    resolve: () => '',
    flush: () => null,
    injectGlobal: () => null,
    keyframes: () => '',
    sheet: {
      inserted: [],
      injected: false,
      insert: () => {},
      flush: () => {},
    },
  };
});

// Note: Auth mocking is handled in individual test files

// Mock NextAuth
jest.mock('next-auth', () => {
  const mockNextAuth = jest.fn(() => ({
    handlers: {},
    signIn: jest.fn(),
    signOut: jest.fn(),
    auth: jest.fn(),
  }));
  return mockNextAuth;
});

// Mock next-auth/providers/cognito
jest.mock('next-auth/providers/cognito', () => {
  const mockCognito = jest.fn(() => ({}));
  return mockCognito;
}, { virtual: true });

// Mock @auth/pg-adapter
jest.mock('@auth/pg-adapter', () => {
  const mockAdapter = jest.fn(() => ({}));
  return mockAdapter;
}, { virtual: true });

// Mock pg module
jest.mock('pg', () => ({
  Pool: jest.fn(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    end: jest.fn(),
    on: jest.fn(),
  })),
  Client: jest.fn(() => ({
    connect: jest.fn(),
    query: jest.fn(),
    release: jest.fn(),
    end: jest.fn(),
  })),
}));

// Note: dbAdapter mocking is handled in individual test files

// Mock logger modules
jest.mock('lib/logging/logger.client', () => ({
  clientLogger: {
    error: jest.fn(),
    warn: jest.fn(),
    info: jest.fn(),
    debug: jest.fn(),
  },
}), { virtual: true });

// Note: Logger mocking is handled in individual test files

// Note: Auth mocking is handled in individual test files

// Mock environment variables
process.env.NEXT_PUBLIC_COGNITO_CLIENT = 'test-client-id';

// Mock fetch globally
global.fetch = jest.fn();

// Mock Response object
global.Response = {
  json: jest.fn((data, init) => ({
    json: () => Promise.resolve(data),
    status: init?.status || 200,
    headers: new Map(),
  })),
  error: jest.fn(),
  redirect: jest.fn(),
} as any;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock IntersectionObserver
global.IntersectionObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
}));

// Mock console methods to reduce noise in tests
const originalConsole = { ...console };

beforeAll(() => {
  console.error = jest.fn();
  console.warn = jest.fn();
  console.log = jest.fn();
});

afterAll(() => {
  Object.assign(console, originalConsole);
});
