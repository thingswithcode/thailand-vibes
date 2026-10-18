import { expect, test, type Page } from '@playwright/test';
import { collectPageErrors } from './helpers';

const URL = '/en/destinations/bangkok/';
const pins = (page: Page) => page.locator('[data-place-map] .tv-pin');

async function openMap(page: Page) {
  await page.goto(URL);
  await page.mouse.wheel(0, 200);
  await page.locator('[data-place-map]').scrollIntoViewIfNeeded();
}

test('every tip with a fixed place gets a pin', async ({ page }) => {
  await openMap(page);
  await expect(pins(page)).toHaveCount(8);
  await expect(page.locator('[data-place-map]')).toHaveAttribute('data-map-ready', 'true');
});

test('the filter hides pins and an empty category does not break the map', async ({ page }) => {
  const errors = collectPageErrors(page);
  await openMap(page);
  await expect(pins(page)).toHaveCount(8);
  await page.getByRole('button', { name: /^Nightlife/ }).click();
  await expect(pins(page)).toHaveCount(2);
  await page.getByRole('button', { name: /^Wellness/ }).click();
  await expect(pins(page)).toHaveCount(0);
  await page.getByRole('button', { name: /^All/ }).click();
  await expect(pins(page)).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('clicking a pin scrolls to its tip', async ({ page }) => {
  await openMap(page);
  await page.getByRole('button', { name: 'Soi Cowboy' }).click();
  await expect(page.locator('#tip-bangkok-soi-cowboy')).toBeInViewport();
});

test('a pin works with the keyboard', async ({ page }) => {
  await openMap(page);
  await page.getByRole('button', { name: 'IconSiam' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tip-bangkok-iconsiam')).toBeInViewport();
});

test('the page stays usable when the map tiles cannot load', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.route('https://tiles.openfreemap.org/**', (route) => route.abort());
  await openMap(page);
  await expect(page.locator('#tips [data-filter-item]')).toHaveCount(11);
  await expect(pins(page)).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('the page stays usable without WebGL', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, type: string, options?: unknown) => unknown;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, type: string, options?: unknown) {
        return type.startsWith('webgl') ? null : original.call(this, type, options);
      },
    });
  });
  await openMap(page);
  await expect(page.locator('[data-place-map]')).toHaveAttribute('data-map-ready', 'failed');
  await expect(page.locator('#tips [data-filter-item]').first()).toBeVisible();
  expect(errors).toEqual([]);
});

test('the map waits for the first interaction so it does not slow down the first load', async ({ page }) => {
  await page.goto(URL);
  await page.waitForTimeout(1500);
  await expect(page.locator('[data-place-map]')).toHaveAttribute('data-map-ready', 'pending');
  await page.mouse.wheel(0, 200);
  await page.locator('[data-place-map]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-place-map]')).toHaveAttribute('data-map-ready', 'true');
});

test('a pin names its visible number together with the tip', async ({ page }) => {
  await openMap(page);
  await expect(page.getByRole('button', { name: '10: Soi Cowboy', exact: true })).toHaveCount(1);
});

test('a filter chosen before the map has loaded still applies to the pins', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto(URL);
  await page.getByRole('button', { name: /^Nightlife/ }).click();
  await page.locator('[data-place-map]').scrollIntoViewIfNeeded();
  await expect(page.locator('[data-place-map]')).toHaveAttribute('data-map-ready', 'true');
  await expect(pins(page)).toHaveCount(2);
  expect(errors).toEqual([]);
});
