import { describe, expect, it } from 'vitest';
import { thailandShape } from '../../src/lib/geo';

describe('thailandShape', () => {
  const shape = thailandShape(360, 620);

  it('draws a compact outline', () => {
    expect(shape.path.startsWith('M')).toBe(true);
    expect(shape.path.length).toBeGreaterThan(2000);
    expect(shape.path.length).toBeLessThan(15000);
  });

  it('projects Bangkok to the head of the gulf', () => {
    const [x, y] = shape.project([13.7563, 100.5018]);
    expect(x).toBeGreaterThan(130);
    expect(x).toBeLessThan(148);
    expect(y).toBeGreaterThan(275);
    expect(y).toBeLessThan(295);
  });

  it('keeps the north above Bangkok and Koh Phangan below it', () => {
    const bangkok = shape.project([13.7563, 100.5018])[1];
    expect(shape.project([19.9105, 99.8406])[1]).toBeLessThan(bangkok);
    expect(shape.project([9.7319, 100.0136])[1]).toBeGreaterThan(bangkok);
  });
});
