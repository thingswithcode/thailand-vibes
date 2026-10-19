import { expect, test } from '@playwright/test';

test('the root address forwards to the English home page', async ({ page }) => {
  await page.goto('');
  await page.waitForURL('**/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the language switch leads to the same page in German and back', async ({ page }) => {
  await page.goto('en/');
  await page.getByRole('banner').getByRole('link', { name: 'Deutsch' }).click();
  await expect(page).toHaveURL(/\/de\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.getByRole('banner').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test('desktop shows the main navigation without a menu button', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop only');
  await page.goto('en/');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Destinations' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
});

test('the mobile menu opens, closes with Escape and hands focus back', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile only');
  await page.goto('de/');
  const button = page.getByRole('button', { name: 'Menü' });
  const nav = page.locator('#site-nav');
  await expect(nav).toBeHidden();
  await button.click();
  await expect(nav).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(button).toBeFocused();
});
