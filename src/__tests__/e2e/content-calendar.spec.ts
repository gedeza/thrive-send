import { test, expect } from '@playwright/test';

test.describe('Content Calendar - E2E', () => {
  test('Editor can create content', async ({ page }) => {
    // Navigate to the content calendar page
    await page.goto("/dashboard/content-calendar");
    
    // Debug: Take a screenshot to see what's actually on the page
    await page.screenshot({ path: 'debug-content-calendar.png', fullPage: true });
    
    // Debug: Get page info
    const title = await page.title();
    const url = page.url();
    const pageContent = await page.textContent('body');
    
    console.log('=== DEBUG INFO ===');
    console.log('Page title:', title);
    console.log('Current URL:', url);
    console.log('Page body text (first 500 chars):', pageContent?.substring(0, 500));
    
    // Check if we're on a login page
    const hasLoginForm = await page.locator('form').count();
    const hasPasswordField = await page.locator('input[type="password"]').count();
    console.log('Has forms:', hasLoginForm);
    console.log('Has password fields:', hasPasswordField);
    
    // Fail the test with useful info
    throw new Error(`Debug info - Title: ${title}, URL: ${url}, Has forms: ${hasLoginForm}`);
  });
});