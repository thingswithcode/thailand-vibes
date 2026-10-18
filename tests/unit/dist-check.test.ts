import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { anchorExists, extractInternalUrls, findPlaceholders, targetFile } from '../../scripts/lib/dist-check.mjs';

let dist = '';

beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), 'tv-dist-'));
  mkdirSync(join(dist, 'en', 'destinations', 'bangkok'), { recursive: true });
  writeFileSync(join(dist, 'en', 'destinations', 'bangkok', 'index.html'), '<article id="tip-bangkok-tichuca" data-active-id="bangkok-tichuca"></article>');
  mkdirSync(join(dist, '_astro'));
  writeFileSync(join(dist, '_astro', 'a.webp'), '');
});

describe('extractInternalUrls', () => {
  it('collects internal href, src and srcset urls and ignores external ones', () => {
    const html = '<a href="/en/"></a><a href="https://x.org/"></a><img src="/_astro/a.webp" srcset="/_astro/a.webp 400w, /_astro/b.webp 800w"><a href="//cdn.x/"></a>';
    expect(extractInternalUrls(html).sort()).toEqual(['/_astro/a.webp', '/_astro/b.webp', '/en/']);
  });
});

describe('targetFile and anchorExists', () => {
  it('resolves directories to index.html and files directly', () => {
    expect(targetFile(dist, '/en/destinations/bangkok/')).toBe(join(dist, 'en', 'destinations', 'bangkok', 'index.html'));
    expect(targetFile(dist, '/_astro/a.webp')).toBe(join(dist, '_astro', 'a.webp'));
    expect(targetFile(dist, '/en/nope/')).toBeNull();
  });

  it('checks that the anchor exists on the target page', () => {
    expect(anchorExists(dist, '/en/destinations/bangkok/#tip-bangkok-tichuca')).toBe(true);
    expect(anchorExists(dist, '/en/destinations/bangkok/#tip-missing')).toBe(false);
  });

  it('does not mistake data attributes for ids', () => {
    expect(anchorExists(dist, '/en/destinations/bangkok/#bangkok-tichuca')).toBe(false);
  });
});

describe('findPlaceholders', () => {
  it('finds bracketed capital placeholders only', () => {
    expect(findPlaceholders('Name: [VORNAME NACHNAME], Mail: [E-MAIL-ADRESSE], array[0], [Link]')).toEqual(['[VORNAME NACHNAME]', '[E-MAIL-ADRESSE]']);
  });
});
