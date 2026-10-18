import { parseMapsUrl } from '../src/lib/maps-link.ts';

const links = process.argv.slice(2);
if (links.length === 0) {
  console.error('Usage: node scripts/resolve-maps-link.ts <maps.app.goo.gl link> [...]');
  process.exit(1);
}

for (const link of links) {
  const response = await fetch(link, { redirect: 'manual', headers: { 'User-Agent': 'Mozilla/5.0' } });
  const target = response.headers.get('location') ?? link;
  const place = parseMapsUrl(target);
  console.log(place
    ? `${link}\n  coords: [${place.lat}, ${place.lng}]${place.name ? `\n  name: ${place.name}` : ''}`
    : `${link}\n  no coordinates found in ${target}`);
}
