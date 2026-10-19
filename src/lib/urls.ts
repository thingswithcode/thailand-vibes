import { LANGS, type Lang } from '../i18n/types';

export function withBase(base: string, path: string): string {
  const prefix = base.endsWith('/') ? base : `${base}/`;
  return `${prefix}${path.replace(/^\/+/, '')}`;
}

export function pathFor(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  const local = clean === '' ? `${lang}/` : `${lang}/${clean.endsWith('/') ? clean : `${clean}/`}`;
  return withBase(import.meta.env.BASE_URL ?? '/', local);
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'de' : 'en';
}

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export function langPaths(): { params: { lang: Lang } }[] {
  return LANGS.map((lang) => ({ params: { lang } }));
}
