import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/types';
import { findContentProblems, invariantOf, type CheckItem } from './content-checks';
import { splitId } from './ids';

type Name = 'places' | 'tips' | 'restaurants' | 'skips';

export interface Localized<C extends Name> {
  slug: string;
  entry: CollectionEntry<C>;
}

const NAMES: Name[] = ['places', 'tips', 'restaurants', 'skips'];
const photoKey = (photo: unknown) => (photo as { src: { src: string } }).src.src;

let validation: Promise<void> | undefined;

export function ensureContentValid(): Promise<void> {
  validation ??= (async () => {
    const items: CheckItem[] = [];
    for (const name of NAMES) {
      for (const entry of await getCollection(name)) {
        const { lang, slug } = splitId(entry.id);
        const data = entry.data as Record<string, unknown>;
        items.push({
          collection: name,
          lang,
          slug,
          invariant: invariantOf(name, data, photoKey),
          placeRef: typeof data.place === 'string' ? data.place : undefined,
          tipRef: typeof data.insteadTip === 'string' ? data.insteadTip : undefined,
        });
      }
    }
    const problems = findContentProblems(items);
    if (problems.length > 0) throw new Error(`Content problems:\n- ${problems.join('\n- ')}`);
  })();
  return validation;
}

async function localized<C extends Name>(name: C, lang: Lang): Promise<Localized<C>[]> {
  await ensureContentValid();
  const entries = (await getCollection(name)) as CollectionEntry<C>[];
  return entries
    .filter((entry) => splitId(entry.id).lang === lang)
    .map((entry) => ({ slug: splitId(entry.id).slug, entry }));
}

const orderOf = (entry: { data: unknown }) => (entry.data as { order?: number }).order ?? 0;

function byOrder<C extends Name>(a: Localized<C>, b: Localized<C>): number {
  return orderOf(a.entry) - orderOf(b.entry);
}

export async function getPlaces(lang: Lang): Promise<Localized<'places'>[]> {
  return (await localized('places', lang)).sort(byOrder);
}

export async function getPlace(lang: Lang, slug: string): Promise<Localized<'places'> | undefined> {
  return (await getPlaces(lang)).find((place) => place.slug === slug);
}

export async function getTips(lang: Lang, place: string): Promise<Localized<'tips'>[]> {
  return (await localized('tips', lang)).filter((tip) => tip.entry.data.place === place).sort(byOrder);
}

export async function getTip(lang: Lang, slug: string): Promise<Localized<'tips'> | undefined> {
  return (await localized('tips', lang)).find((tip) => tip.slug === slug);
}

export async function getThailandTips(lang: Lang, featuredOnly = false): Promise<Localized<'tips'>[]> {
  const tips = await getTips(lang, 'thailand');
  return featuredOnly ? tips.filter((tip) => tip.entry.data.featured) : tips;
}

export async function getRestaurants(lang: Lang, place: string): Promise<Localized<'restaurants'>[]> {
  return (await localized('restaurants', lang)).filter((r) => r.entry.data.place === place).sort(byOrder);
}

export async function getSkips(lang: Lang): Promise<Localized<'skips'>[]> {
  return (await localized('skips', lang)).sort(byOrder);
}

export async function getPlaceOverview(
  lang: Lang,
): Promise<{ place: Localized<'places'>; tipCount: number; featured: Localized<'tips'>[] }[]> {
  const places = await getPlaces(lang);
  return Promise.all(
    places.map(async (place) => {
      const tips = await getTips(lang, place.slug);
      return { place, tipCount: tips.length, featured: tips.filter((tip) => tip.entry.data.featured).slice(0, 4) };
    }),
  );
}
