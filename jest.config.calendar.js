module.exports = {
  preset: 'ts-jest',
  testEnvironment: 'node',
  testMatch: ['**/src/__tests__/api/calendar.test.ts'],
  setupFilesAfterEnv: ['./jest.setup.api.js'],
  transform: {
    '^.+\\.tsx?$': ['ts-jest', {
      tsconfig: 'tsconfig.json',
      isolatedModules: true
    }]
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx', 'json', 'node'],
  // Explicitly set the root directory
  rootDir: '.',
  // Handle module aliases (if any)
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1'
  }
};
