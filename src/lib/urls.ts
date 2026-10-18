import { LANGS, type Lang } from '../i18n/types';

export function pathFor(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  if (clean === '') return `/${lang}/`;
  return `/${lang}/${clean.endsWith('/') ? clean : `${clean}/`}`;
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
