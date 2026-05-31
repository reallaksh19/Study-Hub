import { test, expect } from '@playwright/test';

test('screenshot landing page', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await page.waitForTimeout(2000);
  await page.screenshot({ path: '/app/screenshot3.png', fullPage: true });
});
