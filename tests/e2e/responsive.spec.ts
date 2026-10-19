import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll } from './helpers';

const PAGES = [
  'en/', 'de/',
  'en/destinations/', 'de/destinations/',
  'en/destinations/bangkok/', 'de/destinations/bangkok/',
  'en/all-over-thailand/', 'de/all-over-thailand/',
  'en/destinations/bangkok/food/', 'de/destinations/bangkok/food/',
];

for (const path of PAGES) {
  test(`${path} never scrolls sideways`, async ({ page }) => {
    await page.goto(path);
    await expectNoHorizontalScroll(page);
  });

  test(`${path} has a heading outline without gaps`, async ({ page }) => {
    await page.goto(path);
    const levels = await page.locator('h1, h2, h3, h4, h5, h6').evaluateAll((els) => els.map((el) => Number(el.tagName[1])));
    const gaps = levels.filter((level, i) => i > 0 && level > levels[i - 1] + 1);
    expect(gaps, `heading levels: ${levels.join(',')}`).toEqual([]);
  });

  test(`${path} gives every image a text alternative`, async ({ page }) => {
    await page.goto(path);
    expect(await page.locator('img:not([alt])').count()).toBe(0);
  });
}
