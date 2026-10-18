import { defineConfig, devices } from '@playwright/test';

const external = process.env.TV_BASE_URL;
const launchOptions = { args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: external ?? 'http://localhost:4330', launchOptions },
  webServer: external
    ? undefined
    : { command: 'npx astro preview --port 4330 --ignore-lock', url: 'http://localhost:4330/en/', reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 }, launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, launchOptions } },
  ],
});
