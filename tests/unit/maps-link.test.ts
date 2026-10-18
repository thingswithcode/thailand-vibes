import { describe, expect, it } from 'vitest';
import { parseMapsUrl } from '../../src/lib/maps-link';

const WAT_PAKNAM = 'https://www.google.com/maps/place/Wat+Paknam+Phasi+Charoen/@13.7217762,100.467783,17z/data=!3m1!4b1!4m6!3m5!1s0x30e29845c0d705bf:0x10c8ec5ed763670b!8m2!3d13.7217762!4d100.4703579!16zL20vMDhuMXk4?entry=tts';

describe('parseMapsUrl', () => {
  it('prefers the pin position over the map centre', () => {
    expect(parseMapsUrl(WAT_PAKNAM)).toEqual({ lat: 13.7217762, lng: 100.4703579, name: 'Wat Paknam Phasi Charoen' });
  });

  it('falls back to the map centre', () => {
    expect(parseMapsUrl('https://www.google.com/maps/@13.75,100.5,15z')).toEqual({ lat: 13.75, lng: 100.5 });
  });

  it('returns null without coordinates', () => {
    expect(parseMapsUrl('https://maps.app.goo.gl/abc')).toBeNull();
  });
});
