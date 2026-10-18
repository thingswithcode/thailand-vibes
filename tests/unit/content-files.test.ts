import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { findContentProblems, invariantOf, type CheckItem, type CollectionName } from '../../src/lib/content-checks';

const ROOT = resolve(import.meta.dirname, '../../src/content');

interface ContentFile { file: string; collection: CollectionName; lang: string; data: Record<string, unknown>; body: string; text: string }

function readAll(): ContentFile[] {
  const files: ContentFile[] = [];
  for (const collection of readdirSync(ROOT) as CollectionName[]) {
    for (const lang of readdirSync(join(ROOT, collection))) {
      for (const name of readdirSync(join(ROOT, collection, lang)).filter((f) => f.endsWith('.md'))) {
        const file = join(ROOT, collection, lang, name);
        const text = readFileSync(file, 'utf8');
        const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
        if (!match) throw new Error(`${file}: missing frontmatter`);
        files.push({ file, collection, lang, data: parse(match[1]) as Record<string, unknown>, body: match[2].trim(), text });
      }
    }
  }
  return files;
}

const files = readAll();
const items: CheckItem[] = files.map(({ file, collection, lang, data }) => ({
  collection,
  lang,
  slug: file.split('/').at(-1)!.replace(/\.md$/, ''),
  invariant: invariantOf(collection, data, (photo) => (photo as { src: string }).src),
  placeRef: typeof data.place === 'string' ? data.place : undefined,
  tipRef: typeof data.insteadTip === 'string' ? data.insteadTip : undefined,
  onlyLang: typeof data.onlyLang === 'string' ? data.onlyLang : undefined,
}));

describe('content files', () => {
  it('pair up across languages and reference existing places and tips', () => {
    expect(findContentProblems(items)).toEqual([]);
  });

  it('only reference photos that exist', () => {
    const missing: string[] = [];
    for (const { file, data } of files) {
      const photos = [...((data.photos as { src: string }[] | undefined) ?? []), ...(data.cover ? [data.cover as { src: string }] : [])];
      for (const photo of photos) if (!existsSync(resolve(dirname(file), photo.src))) missing.push(`${file}: ${photo.src}`);
    }
    expect(missing).toEqual([]);
  });

  it('have text in every tip, restaurant and skip', () => {
    const empty = files.filter((f) => ['tips', 'restaurants', 'skips'].includes(f.collection) && f.body === '').map((f) => f.file);
    expect(empty).toEqual([]);
  });

  it('contain no em dashes', () => {
    expect(files.filter((f) => f.text.includes('—')).map((f) => f.file)).toEqual([]);
  });

  it('contain the eleven Bangkok tips and fourteen tips for all of Thailand', () => {
    const tipsIn = (place: string) => items.filter((i) => i.collection === 'tips' && i.lang === 'en' && i.placeRef === place);
    expect(tipsIn('bangkok')).toHaveLength(11);
    expect(tipsIn('thailand')).toHaveLength(14);
  });
});
