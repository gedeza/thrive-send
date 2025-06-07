module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  setupFilesAfterEnv: ['<rootDir>/jest.setup.api.js'],
  
  // Module name mapping
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  },
  
  // Transform configuration
  transform: {
    '^.+\\.(ts|tsx)$': ['ts-jest', {
      tsconfig: {
        module: 'commonjs',
        esModuleInterop: true,
        allowSyntheticDefaultImports: true,
        moduleResolution: 'node',
        baseUrl: './src',
        paths: {
          '@/*': ['*']
        }
      }
    }]
  },
  
  // API test patterns only
  testMatch: [
    '<rootDir>/__tests__/api/**/*.(ts|js)',
    '<rootDir>/src/**/__tests__/**/*api*.(ts|js)'
  ],
  
  // Module file extensions
  moduleFileExtensions: ['ts', 'js', 'json'],
  
  // Timeout for API tests
  testTimeout: 30000
};