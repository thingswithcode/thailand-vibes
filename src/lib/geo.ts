import { geoMercator, geoPath } from 'd3-geo';
import { feature } from 'topojson-client';
import type { GeometryCollection, Topology } from 'topojson-specification';
import countries from 'world-atlas/countries-50m.json';

export interface ThailandShape {
  width: number;
  height: number;
  path: string;
  project: (coords: [number, number]) => [number, number];
}

const THAILAND_ID = '764';

export function thailandShape(width = 360, height = 620): ThailandShape {
  const topology = countries as unknown as Topology<{ countries: GeometryCollection<{ name: string }> }>;
  const all = feature(topology, topology.objects.countries);
  const thailand = all.features.find((f) => String(f.id) === THAILAND_ID);
  if (!thailand) throw new Error('Thailand is missing in world-atlas/countries-50m.json');
  const projection = geoMercator().fitSize([width, height], thailand);
  const path = geoPath(projection).digits(1)(thailand) ?? '';
  const round = (n: number) => Math.round(n * 10) / 10;
  return {
    width,
    height,
    path,
    project: ([lat, lng]) => {
      const point = projection([lng, lat]);
      if (!point) throw new Error(`Cannot project ${lat}, ${lng}`);
      return [round(point[0]), round(point[1])];
    },
  };
}
