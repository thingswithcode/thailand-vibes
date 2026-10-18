import { expect, test } from '@playwright/test';

test('imprint and privacy are linked from both languages', async ({ page }) => {
  for (const lang of ['en', 'de']) {
    await page.goto(`/${lang}/`);
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: 'Impressum' })).toHaveAttribute('href', '/de/impressum/');
    await expect(footer.getByRole('link', { name: 'Datenschutz' })).toHaveAttribute('href', '/de/datenschutz/');
  }
});

test('the imprint exists only in German and the language switch never leads to a 404', async ({ page, request }) => {
  await page.goto('/de/impressum/');
  await expect(page.getByRole('heading', { level: 1, name: 'Impressum' })).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  expect((await request.get('/en/impressum/')).status()).toBe(404);
});

test('the privacy page names the map provider', async ({ page }) => {
  await page.goto('/de/datenschutz/');
  await expect(page.getByRole('heading', { level: 1, name: 'Datenschutzerklärung' })).toBeVisible();
  await expect(page.getByText('OpenFreeMap', { exact: false }).first()).toBeVisible();
});

test('pages without text are not in the menu yet', async ({ page }) => {
  await page.goto('/en/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Before you come' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'About' })).toHaveCount(0);
});
