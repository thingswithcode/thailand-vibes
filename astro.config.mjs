// @ts-check
import { defineConfig } from 'astro/config';
import { BASE, SITE } from './site.config.mjs';

export default defineConfig({
  site: SITE,
  base: BASE,
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
