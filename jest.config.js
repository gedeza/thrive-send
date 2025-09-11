const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  preset: 'ts-jest',
  testEnvironment: 'jsdom',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  transform: {
    '^.+\\.(ts|tsx)$': 'ts-jest',
    '^.+\\.(js|jsx)$': 'babel-jest',
  },
  testMatch: [
    "<rootDir>/src/**/__tests__/**/*.{js,jsx,ts,tsx}",
    "<rootDir>/src/**/*.(test|spec).{js,jsx,ts,tsx}",
    "!<rootDir>/src/**/*.e2e.{js,jsx,ts,tsx}",
    "!<rootDir>/src/__tests__/e2e/**/*"
  ],
  projects: [
    {
      displayName: 'client',
      testEnvironment: 'jsdom',
      testMatch: [
        '<rootDir>/src/components/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/src/app/**/*.test.{js,jsx,ts,tsx}',
        '<rootDir>/src/hooks/**/*.test.{js,jsx,ts,tsx}',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': ['ts-jest', {
          tsconfig: {
            jsx: 'react-jsx',
          },
        }],
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
    },
    {
      displayName: 'api',
      testEnvironment: 'node',
      testMatch: [
        '<rootDir>/src/__tests__/api/**/*.test.{js,ts}',
        '<rootDir>/src/lib/**/*.test.{js,ts}',
        '<rootDir>/src/middleware/**/*.test.{js,ts}',
      ],
      setupFilesAfterEnv: ['<rootDir>/jest.setup.api.js'],
      moduleNameMapper: {
        '^@/(.*)$': '<rootDir>/src/$1',
      },
      transform: {
        '^.+\\.(ts|tsx)$': 'ts-jest',
        '^.+\\.(js|jsx)$': 'babel-jest',
      },
    },
  ],
  collectCoverageFrom: [
    'src/**/*.{js,jsx,ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.e2e.{js,jsx,ts,tsx}',
    '!src/__tests__/e2e/**/*',
  ],
};

module.exports = createJestConfig(customJestConfig);
