import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: 'e2e/',
  /* You can change the test directory if using a different structure.
     For example: 
     testDir: 'src/__tests__/e2e', 
     but make sure Jest ignores this in its config!
  */
  timeout: 30 * 1000,
  expect: {
    timeout: 5000, // default timeout for expect()
  },
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 2 : undefined,
  reporter: [['list'], ['html', { outputFolder: 'playwright-report', open: 'never' }]],
  use: {
    browserName: 'chromium',
    headless: true,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    baseURL: process.env.PLAYWRIGHT_BASE_URL || 'http://localhost:3000',
    viewport: { width: 1280, height: 800 },
    ignoreHTTPSErrors: true,
    ...devices['Desktop Chrome'],
  },
  projects: [
    {
      name: 'Desktop Chrome',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'Mobile Safari',
      use: { ...devices['iPhone 13'] },
    }
  ],
  outputDir: 'test-results/',
  webServer: {
    command: 'pnpm dev',
    port: 3000,
    timeout: 120 * 1000,
    reuseExistingServer: !process.env.CI,
    env: {
      NODE_ENV: 'test',
    },
  },
  /* Exclude unit/integration test folders entirely. */
  testIgnore: [
    '**/node_modules/**',
    '**/src/**',
    '**/__tests__/**',
    '**/components/**',
    '**/*.test.*',
    '**/*.spec.*',
  ],
});