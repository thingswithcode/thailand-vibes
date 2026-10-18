import { expect, test } from '@playwright/test';

test('the Bangkok food page lists all restaurants', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/food/');
  await expect(page.getByRole('heading', { level: 1, name: 'Food & drinks in Bangkok' })).toBeVisible();
  await expect(page.locator('.restaurant')).toHaveCount(8);
  await expect(page.getByRole('button', { name: /^Thai food/ })).toBeVisible();
});

test('the street food tip leads to the food page', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await page.getByRole('link', { name: 'My favorite restaurants in Bangkok →' }).click();
  await expect(page).toHaveURL(/\/en\/destinations\/bangkok\/food\/$/);
  await expect(page.getByRole('heading', { level: 1, name: 'Food & drinks in Bangkok' })).toBeVisible();
});

test('restaurants with a known location get a pin', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/food/');
  await page.locator('[data-place-map]').scrollIntoViewIfNeeded();
  const withCoords = await page.locator('.restaurant[data-has-pin="true"]').count();
  expect(withCoords).toBeGreaterThanOrEqual(4);
  await expect(page.locator('[data-place-map] .tv-pin')).toHaveCount(withCoords);
});

test('the German food page is German', async ({ page }) => {
  await page.goto('/de/destinations/bangkok/food/');
  await expect(page.getByRole('heading', { level: 1, name: 'Essen & Trinken in Bangkok' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Thailändisch/ })).toBeVisible();
});
