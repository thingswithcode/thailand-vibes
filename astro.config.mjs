// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: false },
  },
});
