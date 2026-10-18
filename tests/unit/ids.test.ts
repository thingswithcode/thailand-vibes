import { describe, expect, it } from 'vitest';
import { splitId } from '../../src/lib/ids';

describe('splitId', () => {
  it('splits a content id into language and slug', () => {
    expect(splitId('en/bangkok-wat-paknam')).toEqual({ lang: 'en', slug: 'bangkok-wat-paknam' });
    expect(splitId('de/bangkok')).toEqual({ lang: 'de', slug: 'bangkok' });
  });

  it('rejects ids without a known language folder', () => {
    expect(() => splitId('bangkok')).toThrow(/must look like/);
    expect(() => splitId('fr/bangkok')).toThrow(/must look like/);
  });
});
