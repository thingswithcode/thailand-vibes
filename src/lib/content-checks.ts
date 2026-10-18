import { LANGS } from '../i18n/types';

export type CollectionName = 'places' | 'tips' | 'restaurants' | 'skips' | 'pages';

export const INVARIANT_FIELDS: Record<CollectionName, readonly string[]> = {
  places: ['region', 'order', 'coords', 'mapLabelSide', 'cover'],
  tips: ['place', 'number', 'order', 'category', 'coords', 'maps', 'featured', 'tile', 'photos'],
  restaurants: ['place', 'cuisine', 'order', 'coords', 'mapsUrl', 'photos'],
  skips: ['order', 'insteadTip'],
  pages: ['onlyLang'],
};

export interface CheckItem {
  collection: CollectionName;
  lang: string;
  slug: string;
  invariant: string;
  placeRef?: string;
  tipRef?: string;
  onlyLang?: string;
}

export function invariantOf(
  collection: CollectionName,
  data: Record<string, unknown>,
  photoKey: (photo: unknown) => unknown,
): string {
  const picked: Record<string, unknown> = {};
  for (const field of INVARIANT_FIELDS[collection]) {
    const value = data[field];
    if (field === 'photos' && Array.isArray(value)) picked[field] = value.map((photo) => photoKey(photo));
    else if (field === 'cover' && value) picked[field] = photoKey(value);
    else picked[field] = value ?? null;
  }
  return JSON.stringify(picked);
}

export function findContentProblems(items: CheckItem[]): string[] {
  const problems: string[] = [];
  const keyOf = (item: CheckItem) => `${item.collection}/${item.slug}`;
  const groups = new Map<string, CheckItem[]>();
  for (const item of items) groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item]);

  for (const [key, group] of groups) {
    const onlyLang = group.find((entry) => entry.onlyLang)?.onlyLang;
    const expected = onlyLang ? [onlyLang] : [...LANGS];
    for (const lang of expected) {
      if (!group.some((entry) => entry.lang === lang)) problems.push(`${key}: missing ${lang} version`);
    }
    if (new Set(group.map((entry) => entry.invariant)).size > 1) {
      problems.push(`${key}: fields that must be identical in all languages differ (${INVARIANT_FIELDS[group[0].collection].join(', ')})`);
    }
  }

  const places = new Set(items.filter((item) => item.collection === 'places').map((item) => item.slug));
  const tips = new Set(items.filter((item) => item.collection === 'tips').map((item) => item.slug));
  for (const item of items) {
    if (item.placeRef !== undefined && item.placeRef !== 'thailand' && !places.has(item.placeRef)) {
      problems.push(`${keyOf(item)} (${item.lang}): unknown place "${item.placeRef}"`);
    }
    if (item.tipRef !== undefined && !tips.has(item.tipRef)) {
      problems.push(`${keyOf(item)} (${item.lang}): unknown tip "${item.tipRef}"`);
    }
  }
  return problems;
}
