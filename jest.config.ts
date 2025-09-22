/**
 * For a detailed explanation regarding each configuration property, visit:
 * https://jestjs.io/docs/configuration
 */

import type {Config} from 'jest';
import nextJest from 'next/jest.js';

const createJestConfig = nextJest({
  // Provide the path to your Next.js app to load next.config.js and .env files
  dir: './',
});

const config: Config = {
  // Automatically clear mock calls, instances, contexts and results before every test
  clearMocks: true,

  // Indicates whether the coverage information should be collected while executing the test
  collectCoverage: true,

  // An array of glob patterns indicating a set of files for which coverage information should be collected
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.{js,jsx,ts,tsx}',
    '!src/**/*.test.{js,jsx,ts,tsx}',
    '!src/**/*.spec.{js,jsx,ts,tsx}',
    '!src/**/node_modules/**',
  ],

  // The directory where Jest should output its coverage files
  coverageDirectory: "coverage",

  // An array of regexp pattern strings used to skip coverage collection
  coveragePathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
  ],

  // Indicates which provider should be used to instrument code for coverage
  coverageProvider: "v8",

  // A list of reporter names that Jest uses when writing coverage reports
  coverageReporters: [
    "json",
    "text",
    "lcov",
    "clover"
  ],

  // An object that configures minimum threshold enforcement for coverage results
  coverageThreshold: {
    global: {
      branches: 3,
      functions: 3,
      lines: 3,
      statements: 3,
    },
  },

  // The test environment that will be used for testing
  testEnvironment: "jsdom",

  // The glob patterns Jest uses to detect test files
  testMatch: [
    "<rootDir>/__tests__/**/*.test.?([mc])[jt]s?(x)",
    "<rootDir>/__tests__/**/*.spec.?([mc])[jt]s?(x)",
    "<rootDir>/tests/**/*.test.?([mc])[jt]s?(x)",
    "<rootDir>/tests/**/*.spec.?([mc])[jt]s?(x)",
    "**/?(*.)+(spec|test).?([mc])[jt]s?(x)"
  ],

  // An array of regexp pattern strings that are matched against all test paths, matched tests are skipped
  testPathIgnorePatterns: [
    "/node_modules/",
    "/.next/",
    "/coverage/",
    "/e2e/",
    "/tests/__mocks__/",
    "/tests/__fixtures__/",
    "/tests/utils/",
    "/tests/setup/"
  ],

  // A list of paths to modules that run some code to configure or set up the testing framework before each test
  setupFilesAfterEnv: ['<rootDir>/jest.setup.ts'],

  // A map from regular expressions to module names or to arrays of module names that allow to stub out resources with a single module
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/lib/(.*)$': '<rootDir>/src/app/lib/$1',
    '^@tests/(.*)$': '<rootDir>/tests/$1',
    '^@fixtures/(.*)$': '<rootDir>/tests/__fixtures__/$1',
    '^@mocks/(.*)$': '<rootDir>/tests/__mocks__/$1',
    '^lib/(.*)$': '<rootDir>/src/app/lib/$1',
    '^api/(.*)$': '<rootDir>/src/app/api/$1',
    '^auth$': '<rootDir>/src/app/auth.ts',
  },

  // An array of regexp pattern strings that are matched against all source file paths before re-running tests in watch mode
  transformIgnorePatterns: [
    "/node_modules/(?!(next-auth|@auth/core|@auth/providers|@auth/pg-adapter|@auth/core/providers)/)",
    "^.+\\.module\\.(css|sass|scss)$"
  ],

  // Indicates whether each individual test should be reported during the run
  verbose: true,
};

export default createJestConfig(config);