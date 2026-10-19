import { existsSync, readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

const root = resolve(import.meta.dirname, '../..');

describe('GitHub Pages deploy', () => {
  it('runs all checks including the strict dist check before publishing', () => {
    const pkg = JSON.parse(readFileSync(resolve(root, 'package.json'), 'utf8')) as { scripts: Record<string, string> };
    expect(pkg.scripts.deploy).toBe('bash scripts/deploy-pages.sh');
    const script = readFileSync(resolve(root, 'scripts/deploy-pages.sh'), 'utf8');
    expect(script).toMatch(/npm run verify/);
    expect(script).toMatch(/check-dist\.mjs --strict/);
    expect(script).toMatch(/gh-pages/);
  });

  it('ships a .nojekyll file so GitHub serves the _astro folder', () => {
    expect(existsSync(resolve(root, 'public/.nojekyll'))).toBe(true);
  });

  it('no longer carries Cloudflare-only files', () => {
    for (const file of ['wrangler.jsonc', 'public/_redirects', 'public/_headers']) expect(existsSync(resolve(root, file)), file).toBe(false);
  });
});
