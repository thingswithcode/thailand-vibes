import type { ExpressionSpecification } from 'maplibre-gl';
import type { Lang } from '../i18n/types';

export type LngLat = [number, number];

export interface MapPin {
  id: string;
  label: string;
  title: string;
  category: string;
  coords: [number, number];
  anchor: string;
}

export function toLngLat([lat, lng]: [number, number]): LngLat {
  return [lng, lat];
}

export function boundsOf(points: LngLat[]): [LngLat, LngLat] | null {
  if (points.length === 0) return null;
  let [minLng, minLat] = points[0];
  let [maxLng, maxLat] = points[0];
  for (const [lng, lat] of points) {
    minLng = Math.min(minLng, lng);
    minLat = Math.min(minLat, lat);
    maxLng = Math.max(maxLng, lng);
    maxLat = Math.max(maxLat, lat);
  }
  return [[minLng, minLat], [maxLng, maxLat]];
}

export function labelField(lang: Lang): ExpressionSpecification {
  return lang === 'de'
    ? ['coalesce', ['get', 'name:de'], ['get', 'name_de'], ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']]
    : ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']];
}

export function pinLabel(number: string | undefined, fallback: number): string {
  return number ? number.replace(/^0/, '') : String(fallback);
}
