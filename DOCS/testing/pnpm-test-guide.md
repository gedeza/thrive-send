# Testing Guide for ThriveSend with pnpm

## Table of Contents
1. [Setup and Installation](#setup-and-installation)
2. [Test Configuration](#test-configuration)
3. [Directory Structure](#directory-structure)
4. [Writing Tests](#writing-tests)
5. [Running Tests](#running-tests)
6. [CI/CD Integration](#cicd-integration)
7. [Troubleshooting](#troubleshooting)

## Setup and Installation

### Install Required Dependencies
```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom @testing-library/user-event jest-environment-jsdom
```

### Additional TypeScript Support
```bash
pnpm add -D @types/jest @babel/preset-typescript
```

## Test Configuration

### Jest Configuration (jest.config.js)
```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  moduleNameMapper: {
    '^@/components/(.*)$': '<rootDir>/src/components/$1',
    '^@/lib/(.*)$': '<rootDir>/src/lib/$1',
    '^@/app/(.*)$': '<rootDir>/src/app/$1',
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  testEnvironment: 'jest-environment-jsdom',
  testPathIgnorePatterns: ['<rootDir>/node_modules/', '<rootDir>/.next/'],
  collectCoverage: true,
  collectCoverageFrom: [
    "src/**/*.{js,jsx,ts,tsx}",
    "!src/**/*.d.ts",
    "!src/**/*.stories.{js,jsx,ts,tsx}",
    "!src/pages/_app.tsx",
    "!src/pages/_document.tsx",
    "!**/node_modules/**",
  ],
  coverageThreshold: {
    global: {
      statements: 40,
      branches: 20,
      functions: 20,
      lines: 40
    },
  },
};

module.exports = createJestConfig(customJestConfig);
```

### Jest Setup (jest.setup.js)
```javascript
import '@testing-library/jest-dom';
import 'whatwg-fetch';
import { TextEncoder, TextDecoder } from 'util';

global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;

// Mock Next.js routing
jest.mock('next/router', () => ({
  useRouter: () => ({
    push: jest.fn(),
    pathname: '/',
    query: {},
    asPath: '/',
  }),
}));

// Mock Clerk authentication
jest.mock('@clerk/nextjs', () => ({
  auth: () => ({ userId: 'test-user-id', sessionId: 'test-session-id' }),
  clerkClient: {
    users: {
      getUser: jest.fn(),
    },
  },
}));

// Reset all mocks automatically between tests
beforeEach(() => {
  jest.clearAllMocks();
});
```

## Directory Structure
```
src/
├── components/
│   ├── ComponentName/
│   │   ├── ComponentName.tsx
│   │   └── __tests__/
│   │       └── ComponentName.test.tsx
├── lib/
│   ├── util.ts
│   └── __tests__/
│       └── util.test.ts
└── __tests__/
    ├── integration/
    │   └── features/
    └── e2e/
```

## Writing Tests

### Component Test Example
```typescript
// src/components/Button/__tests__/Button.test.tsx
import { render, fireEvent, screen } from '@testing-library/react';
import { Button } from '../Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('handles click events', () => {
    const handleClick = jest.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### API Test Example
```typescript
// src/__tests__/api/auth.test.ts
import { POST } from '@/app/api/auth/route';

describe('Auth API', () => {
  it('validates required fields', async () => {
    const req = new Request('http://localhost/api/auth', {
      method: 'POST',
      body: JSON.stringify({}),
    });

    const response = await POST(req);
    expect(response.status).toBe(400);
  });
});
```

## Running Tests

### NPM Scripts
Add these scripts to your package.json:
```json
{
  "scripts": {
    "test": "jest --config jest.config.js",
    "test:watch": "jest --config jest.config.js --watch",
    "test:coverage": "jest --config jest.config.js --coverage",
    "test:ci": "jest --config jest.config.js --ci --coverage"
  }
}
```

### Command Usage
```bash
# Run all tests
pnpm test

# Run tests in watch mode
pnpm test:watch

# Run tests with coverage
pnpm test:coverage

# Run tests in CI mode
pnpm test:ci

# Run specific test file
pnpm test path/to/test-file.test.ts
```

## CI/CD Integration

### GitHub Actions Example
```yaml
name: Test

on:
  push:
    branches: [ main, develop ]
  pull_request:
    branches: [ main, develop ]

jobs:
  test:
    runs-on: ubuntu-latest

    steps:
    - uses: actions/checkout@v2
    
    - name: Setup Node.js
      uses: actions/setup-node@v2
      with:
        node-version: '18'
        
    - name: Install pnpm
      uses: pnpm/action-setup@v2
      with:
        version: 8
        
    - name: Install dependencies
      run: pnpm install
      
    - name: Run tests
      run: pnpm test:ci
```

## Troubleshooting

### Common Issues and Solutions

1. **Multiple Jest Configurations Found**
   ```bash
   Error: Multiple configurations found
   ```
   Solution: Remove Jest configuration from package.json and keep only jest.config.js

2. **Module Not Found Errors**
   ```bash
   Error: Cannot find module '@/components/...'
   ```
   Solution: Check moduleNameMapper in jest.config.js matches tsconfig.json paths

3. **Test Environment Errors**
   ```bash
   Error: TestEnvironment node cannot be used to test code that requires browser environment
   ```
   Solution: Ensure testEnvironment is set to 'jest-environment-jsdom' in jest.config.js

### Best Practices

1. **File Naming Conventions**
   - Unit tests: `*.test.ts(x)`
   - Integration tests: `*.integration.test.ts(x)`
   - E2E tests: `*.e2e.test.ts(x)`

2. **Test Structure**
   ```typescript
   describe('Component/Feature Name', () => {
     beforeEach(() => {
       // Setup
     });

     afterEach(() => {
       // Cleanup
     });

     it('should do something specific', () => {
       // Test
     });
   });
   ```

3. **Coverage Thresholds**
   - Maintain minimum coverage thresholds:
     - Statements: 40%
     - Branches: 20%
     - Functions: 20%
     - Lines: 40%

4. **Mock External Dependencies**
   ```typescript
   jest.mock('external-module', () => ({
     someFunction: jest.fn(),
   }));
   ```

For additional help or specific test examples, please refer to the project documentation or create an issue in the repository.