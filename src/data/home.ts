import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/types';
import bangKachao from '../assets/photos/bangkok/bang-kachao-bike.jpg';
import tuktuk from '../assets/photos/bangkok/tuktuk-night.jpg';
import watPaknam from '../assets/photos/bangkok/wat-paknam-buddha.jpg';

export interface HeroPhoto {
  src: ImageMetadata;
  alt: Record<Lang, string>;
  position: string;
}

export const heroPhotos: HeroPhoto[] = [
  { src: tuktuk, position: '45% 55%', alt: { en: 'A TukTuk with green lights at night', de: 'Ein TukTuk mit grüner Beleuchtung bei Nacht' } },
  { src: watPaknam, position: '55% 50%', alt: { en: 'The giant golden Buddha next to the white stupa of Wat Paknam', de: 'Der riesige goldene Buddha neben der weißen Stupa von Wat Paknam' } },
  { src: bangKachao, position: '50% 40%', alt: { en: 'Biking along a narrow path through the jungle on Bang Kachao', de: 'Mit dem Fahrrad auf einem schmalen Weg durch den Dschungel von Bang Kachao' } },
];
