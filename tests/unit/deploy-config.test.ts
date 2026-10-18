import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

describe('wrangler.jsonc', () => {
  it('builds and runs the strict dist check before every deploy, even a direct wrangler deploy', () => {
    const config = JSON.parse(readFileSync(resolve(import.meta.dirname, '../../wrangler.jsonc'), 'utf8')) as { build?: { command?: string } };
    expect(config.build?.command).toMatch(/npm run build/);
    expect(config.build?.command).toMatch(/check-dist\.mjs --strict/);
  });
});
