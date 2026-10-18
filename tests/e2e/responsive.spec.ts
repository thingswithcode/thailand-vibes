import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll } from './helpers';

const PAGES = [
  '/en/', '/de/',
  '/en/destinations/', '/de/destinations/',
  '/en/destinations/bangkok/', '/de/destinations/bangkok/',
  '/en/all-over-thailand/', '/de/all-over-thailand/',
];

for (const path of PAGES) {
  test(`${path} never scrolls sideways`, async ({ page }) => {
    await page.goto(path);
    await expectNoHorizontalScroll(page);
  });

  test(`${path} gives every image a text alternative`, async ({ page }) => {
    await page.goto(path);
    expect(await page.locator('img:not([alt])').count()).toBe(0);
  });
}
