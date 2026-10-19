import { expect, type Page } from '@playwright/test';
import { BASE } from '../../site.config.mjs';

// Absolute link targets as they appear in href attributes, e.g. href('en/') === '/thailand-vibes/en/'.
export const href = (path: string): string => `${BASE}/${path}`;

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'the page must not scroll sideways').toBeLessThanOrEqual(0);
}
