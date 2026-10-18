import { expect, test, type Page } from '@playwright/test';
import { collectPageErrors, expectNoHorizontalScroll } from './helpers';

const tips = (page: Page) => page.locator('#tips [data-filter-item]');

test('Bangkok shows all eleven tips in order', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await expect(page.getByRole('heading', { level: 1, name: 'Bangkok' })).toBeVisible();
  await expect(tips(page)).toHaveCount(11);
  await expect(tips(page).first().getByRole('heading', { level: 3 })).toHaveText('Wat Paknam Phasi Charoen');
  await expect(tips(page).last().getByRole('heading', { level: 3 })).toHaveText('Recharge on Bang Kachao');
});

test('the filter shows only the chosen category and can be reset', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/en/destinations/bangkok/');
  await page.getByRole('button', { name: /^Nightlife/ }).click();
  await expect(page.getByRole('button', { name: /^Nightlife/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(tips(page).filter({ visible: true })).toHaveCount(2);
  await page.getByRole('button', { name: /^All/ }).click();
  await expect(tips(page).filter({ visible: true })).toHaveCount(11);
  expect(errors).toEqual([]);
});

test('the filter works with the keyboard alone', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await page.getByRole('button', { name: /^Temples/ }).focus();
  await page.keyboard.press('Enter');
  await expect(tips(page).filter({ visible: true })).toHaveCount(1);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /^Markets/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(tips(page).filter({ visible: true })).toHaveCount(1);
});

test('the German page uses German labels and texts', async ({ page }) => {
  await page.goto('/de/destinations/bangkok/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('button', { name: /^Nachtleben/ })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Steig in ein TukTuk' })).toBeVisible();
});

test('places without tips have no page', async ({ request }) => {
  expect((await request.get('/en/destinations/koh-phangan/')).status()).toBe(404);
});

test('maps buttons open the original Google Maps links in a new tab', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  const link = page.locator('#tip-bangkok-wat-paknam').getByRole('link', { name: 'Open in Google Maps ↗' });
  await expect(link).toHaveAttribute('href', 'https://maps.app.goo.gl/GZJXQkbFn25JmQFZA');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(page.locator('#tip-bangkok-massage').getByRole('link', { name: 'Divana on Google Maps ↗' })).toBeVisible();
});

test('the street food tip links to the food page', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await expect(page.getByRole('link', { name: 'My favorite restaurants in Bangkok →' })).toHaveAttribute('href', '/en/destinations/bangkok/food/');
});

test('on phones the chips scroll sideways, the page does not', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile only');
  await page.goto('/de/destinations/bangkok/');
  const scrollable = await page.locator('[data-filter-root] [role="group"]').evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scrollable).toBe(true);
  await expectNoHorizontalScroll(page);
});
