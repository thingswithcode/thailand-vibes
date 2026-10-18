import type { Lang } from '../i18n/types';
import { isLang } from './urls';

export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  const slug = rest.join('/');
  if (!isLang(lang) || slug === '') throw new Error(`Content id "${id}" must look like "<en|de>/<slug>"`);
  return { lang, slug };
}
