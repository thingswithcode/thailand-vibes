export interface MapsPlace {
  lat: number;
  lng: number;
  name?: string;
}

export function parseMapsUrl(url: string): MapsPlace | null {
  const pin = [...url.matchAll(/!3d(-?\d+(?:\.\d+)?)!4d(-?\d+(?:\.\d+)?)/g)].at(-1);
  const centre = /@(-?\d+(?:\.\d+)?),(-?\d+(?:\.\d+)?)/.exec(url);
  const match = pin ?? centre;
  if (!match) return null;
  const nameMatch = /\/place\/([^/]+)/.exec(url);
  const name = nameMatch ? decodeURIComponent(nameMatch[1].replace(/\+/g, ' ')) : undefined;
  return { lat: Number(match[1]), lng: Number(match[2]), ...(name ? { name } : {}) };
}
