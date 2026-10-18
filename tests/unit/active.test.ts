import { describe, expect, it } from 'vitest';
import { pickActive } from '../../src/lib/active';

describe('pickActive', () => {
  it('picks the visible item whose centre is closest to the target line', () => {
    expect(pickActive([
      { id: 'a', top: -400, bottom: -100, hidden: false },
      { id: 'b', top: 200, bottom: 500, hidden: false },
      { id: 'c', top: 600, bottom: 900, hidden: false },
    ], 400)).toBe('b');
  });

  it('ignores hidden and collapsed items', () => {
    expect(pickActive([
      { id: 'a', top: 350, bottom: 450, hidden: true },
      { id: 'b', top: 0, bottom: 0, hidden: false },
      { id: 'c', top: 700, bottom: 900, hidden: false },
    ], 400)).toBe('c');
  });

  it('returns null when nothing is visible', () => {
    expect(pickActive([], 400)).toBeNull();
  });
});
