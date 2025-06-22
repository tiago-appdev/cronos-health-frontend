import { test as setup } from '@playwright/test';

setup('Database and server preparation', async ({ page }) => {
  // Wait for server to be ready
  await page.goto('/');
  
  // Wait for the page to load completely (DOM ready)
  await page.waitForLoadState('domcontentloaded');
  
  // Verify server is responding by waiting for a key element
  await page.waitForSelector('text=Cronos Health', { timeout: 10000 });
  
  // Optional: Wait for any initial API calls to complete
  // This is more reliable than networkidle for modern SPAs
  await page.waitForTimeout(1000);
  
  console.log('✅ Server is ready for testing');
});