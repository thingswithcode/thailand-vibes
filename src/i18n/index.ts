import { de } from './de';
import { en } from './en';
import type { Dict, Lang } from './types';

const dicts: Record<Lang, Dict> = { en, de };

export function t(lang: Lang): Dict {
  return dicts[lang];
}
