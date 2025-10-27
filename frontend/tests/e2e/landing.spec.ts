import { test, expect } from '@playwright/test';

test('landing page headline', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { name: 'AI Mathematics Teacher Assistant' })).toBeVisible();
});
