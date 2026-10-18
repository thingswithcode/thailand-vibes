import { describe, expect, it } from 'vitest';
import { findContentProblems, invariantOf, type CheckItem } from '../../src/lib/content-checks';

const item = (overrides: Partial<CheckItem>): CheckItem => ({
  collection: 'tips', lang: 'en', slug: 'bangkok-tichuca', invariant: '{}', ...overrides,
});

describe('findContentProblems', () => {
  it('accepts a complete language pair with valid references', () => {
    expect(findContentProblems([
      item({ collection: 'places', slug: 'bangkok' }),
      item({ collection: 'places', slug: 'bangkok', lang: 'de' }),
      item({ placeRef: 'bangkok' }),
      item({ lang: 'de', placeRef: 'bangkok' }),
    ])).toEqual([]);
  });

  it('reports a missing German version', () => {
    expect(findContentProblems([item({ placeRef: 'thailand' })])).toEqual(['tips/bangkok-tichuca: missing de version']);
  });

  it('reports fields that differ between languages', () => {
    const problems = findContentProblems([item({ invariant: '{"order":1}' }), item({ lang: 'de', invariant: '{"order":2}' })]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/must be identical in all languages/);
  });

  it('reports unknown places and tips but accepts "thailand"', () => {
    const problems = findContentProblems([
      item({ placeRef: 'atlantis' }), item({ lang: 'de', placeRef: 'atlantis' }),
      item({ collection: 'skips', slug: 'x', tipRef: 'nope' }), item({ collection: 'skips', slug: 'x', lang: 'de', tipRef: 'nope' }),
      item({ slug: 'thailand-singha', placeRef: 'thailand' }), item({ slug: 'thailand-singha', lang: 'de', placeRef: 'thailand' }),
    ]);
    expect(problems).toEqual([
      'tips/bangkok-tichuca (en): unknown place "atlantis"',
      'tips/bangkok-tichuca (de): unknown place "atlantis"',
      'skips/x (en): unknown tip "nope"',
      'skips/x (de): unknown tip "nope"',
    ]);
  });

  it('does not ask for a second language when an entry declares onlyLang', () => {
    expect(findContentProblems([item({ collection: 'pages', slug: 'impressum', lang: 'de', onlyLang: 'de' })])).toEqual([]);
  });
});

describe('invariantOf', () => {
  it('keeps only language-independent fields and reduces photos to their file', () => {
    const value = invariantOf('tips', {
      title: 'Tichuca', order: 3, category: 'rooftops',
      photos: [{ src: 'a.jpg', alt: 'A' }],
    }, (photo) => (photo as { src: string }).src);
    expect(JSON.parse(value)).toEqual({
      place: null, number: null, order: 3, category: 'rooftops', coords: null, maps: null, featured: null, tile: null, photos: ['a.jpg'],
    });
  });
});
