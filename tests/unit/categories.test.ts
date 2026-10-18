import { describe, expect, it } from 'vitest';
import { countOptions, matchesFilter } from '../../src/lib/categories';

describe('countOptions', () => {
  it('counts keys and orders them like the master list, skipping unused ones', () => {
    const options = countOptions(['food', 'temples', 'food'], ['temples', 'markets', 'food'] as const, (k) => k.toUpperCase());
    expect(options).toEqual([
      { key: 'temples', label: 'TEMPLES', count: 1 },
      { key: 'food', label: 'FOOD', count: 2 },
    ]);
  });
});

describe('matchesFilter', () => {
  it('shows everything for "all" and only matching items otherwise', () => {
    expect(matchesFilter('all', 'food')).toBe(true);
    expect(matchesFilter('food', 'food')).toBe(true);
    expect(matchesFilter('food', 'temples')).toBe(false);
    expect(matchesFilter('food', undefined)).toBe(false);
  });
});
