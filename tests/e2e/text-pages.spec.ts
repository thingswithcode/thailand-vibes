import { expect, test } from '@playwright/test';
import { href } from './helpers';

test('the footer has no legal pages (private blog for friends)', async ({ page, request }) => {
  await page.goto('en/');
  const footer = page.getByRole('contentinfo');
  await expect(footer.getByRole('link', { name: 'Impressum' })).toHaveCount(0);
  await expect(footer.getByRole('link', { name: 'Datenschutz' })).toHaveCount(0);
  await expect(footer.getByRole('link', { name: 'Deutsch' })).toHaveAttribute('href', href('de/'));
  expect((await request.get('de/impressum/')).status()).toBe(404);
  expect((await request.get('de/datenschutz/')).status()).toBe(404);
});

test('pages without text are not in the menu yet', async ({ page }) => {
  await page.goto('en/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Before you come' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'About' })).toHaveCount(0);
});
