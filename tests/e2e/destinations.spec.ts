import { expect, test } from '@playwright/test';
import { href } from './helpers';

test('all five places are listed, only Bangkok links to its page', async ({ page }) => {
  await page.goto('en/destinations/');
  await expect(page.locator('.place-card')).toHaveCount(5);
  await expect(page.locator('.place-card[data-active-id="bangkok"]').getByRole('link', { name: 'All 11 tips →' }))
    .toHaveAttribute('href', href('en/destinations/bangkok/'));
  for (const slug of ['koh-phangan', 'chiang-mai', 'chiang-rai', 'kanchanaburi']) {
    await expect(page.locator(`.place-card[data-active-id="${slug}"] a`)).toHaveCount(0);
  }
});

test('the Bangkok card lists four featured tips that link into the page', async ({ page }) => {
  await page.goto('en/destinations/');
  const links = page.locator('.place-card[data-active-id="bangkok"] .rec a');
  await expect(links).toHaveCount(4);
  await expect(links.first()).toHaveAttribute('href', href('en/destinations/bangkok/#tip-bangkok-wat-paknam'));
});

test('the Thailand map shows one pin per place and follows the scroll position', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'sticky map is desktop only');
  await page.goto('en/destinations/');
  await expect(page.locator('.thailand-map [data-pin-id]')).toHaveCount(5);
  await page.locator('.place-card[data-active-id="chiang-mai"]').evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect(page.locator('.thailand-map [data-pin-id="chiang-mai"]')).toHaveClass(/is-active/);
});

test('the skip block points to the better alternative', async ({ page }) => {
  await page.goto('en/destinations/');
  const block = page.locator('.skip-block');
  await expect(block.getByRole('heading', { name: 'Sky Bar at Lebua' })).toBeVisible();
  await expect(block.getByRole('link', { name: 'Go to Tichuca instead →' })).toHaveAttribute('href', href('en/destinations/bangkok/#tip-bangkok-tichuca'));
});

test('the German destinations page uses German region names', async ({ page }) => {
  await page.goto('de/destinations/');
  await expect(page.getByText('Die Hauptstadt')).toBeVisible();
  await expect(page.locator('.skip-block').getByRole('link', { name: 'Stattdessen: Tichuca →' })).toBeVisible();
});
