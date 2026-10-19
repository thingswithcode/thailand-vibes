import { expect, test } from '@playwright/test';
import { href } from './helpers';

test('unknown addresses show the 404 page in both languages', async ({ page }) => {
  const response = await page.goto('en/does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Zurück zum Start' })).toHaveAttribute('href', href('de/'));
});
