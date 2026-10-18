import { download, savePhoto } from './lib/photos.ts';

const [url, target] = process.argv.slice(2);
if (!url || !target) {
  console.error('Usage: node scripts/fetch-photo.ts <image url> <target path under src/assets/photos/>');
  process.exit(1);
}
await savePhoto(await download(url), target);
console.log(`saved ${target}`);
