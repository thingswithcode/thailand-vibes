import { describe, expect, it } from 'vitest';
import { isLang, langPaths, otherLang, pathFor } from '../../src/lib/urls';

describe('pathFor', () => {
  it('builds the home page of a language', () => {
    expect(pathFor('en')).toBe('/en/');
    expect(pathFor('de', '')).toBe('/de/');
  });

  it('adds a trailing slash and strips leading slashes', () => {
    expect(pathFor('en', 'destinations')).toBe('/en/destinations/');
    expect(pathFor('de', '/destinations/bangkok/')).toBe('/de/destinations/bangkok/');
  });
});

describe('language helpers', () => {
  it('switches between the two languages', () => {
    expect(otherLang('en')).toBe('de');
    expect(otherLang('de')).toBe('en');
  });

  it('accepts only known languages', () => {
    expect(isLang('de')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it('lists one static path per language', () => {
    expect(langPaths()).toEqual([{ params: { lang: 'en' } }, { params: { lang: 'de' } }]);
  });
});
