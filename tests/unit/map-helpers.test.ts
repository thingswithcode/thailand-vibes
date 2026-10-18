import { describe, expect, it } from 'vitest';
import { boundsOf, labelField, pinLabel, toLngLat } from '../../src/lib/map-helpers';

describe('map helpers', () => {
  it('turns [lat, lng] into MapLibre order', () => {
    expect(toLngLat([13.72, 100.47])).toEqual([100.47, 13.72]);
  });

  it('computes south-west and north-east corners', () => {
    expect(boundsOf([[100.47, 13.72], [100.58, 13.76], [100.5, 13.7]])).toEqual([[100.47, 13.7], [100.58, 13.76]]);
  });

  it('returns null for an empty selection so the map keeps its view', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('labels the map in the page language with sensible fallbacks', () => {
    expect(labelField('en')).toEqual(['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']]);
    expect(labelField('de')).toEqual(['coalesce', ['get', 'name:de'], ['get', 'name_de'], ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']]);
  });

  it('shows tip numbers without the leading zero', () => {
    expect(pinLabel('01', 1)).toBe('1');
    expect(pinLabel('10+1', 11)).toBe('10+1');
    expect(pinLabel(undefined, 4)).toBe('4');
  });
});
