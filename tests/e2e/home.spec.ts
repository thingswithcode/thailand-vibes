import { expect, test } from '@playwright/test';

test('the home page shows hero, destinations, recommendations and skips', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thailand Vibes');
  const arches = page.locator('.hero .arch img');
  await expect(arches).toHaveCount(3);
  for (const img of await arches.all()) {
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.locator('.place-card')).toHaveCount(5);
  await expect(page.locator('.everywhere .tile')).toHaveCount(7);
  await expect(page.locator('.skip-block')).toBeVisible();
});

test('the recommendations on the home page can be filtered', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('.everywhere').getByRole('button', { name: /^Temples/ }).click();
  await expect(page.locator('.everywhere .tile').filter({ visible: true })).toHaveCount(1);
});

test('the home page links to all tips for all over Thailand', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('link', { name: 'All tips for all over Thailand →' })).toHaveAttribute('href', '/en/all-over-thailand/');
});

test('All over Thailand lists every general tip and filters them', async ({ page }) => {
  await page.goto('/en/all-over-thailand/');
  await expect(page.locator('.everywhere .tile')).toHaveCount(14);
  await page.getByRole('button', { name: /^Drinks/ }).click();
  await expect(page.locator('.everywhere .tile').filter({ visible: true })).toHaveCount(2);
});

test('the German home page is German', async ({ page }) => {
  await page.goto('/de/');
  await expect(page.getByRole('heading', { level: 2, name: 'Wohin die Reise geht' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Alle Tipps für ganz Thailand →' })).toHaveAttribute('href', '/de/all-over-thailand/');
});
