import { join } from 'node:path';
import { download, savePhoto } from './lib/photos.ts';

const PHOTOS: Record<number, { id: string; file: string }> = {
  1: { id: '516253_15dad8d3e17d4ce1a900a836db613c17~mv2.jpg', file: 'wat-paknam-buddha.jpg' },
  2: { id: '516253_21aa8a76234b441f9a9770fbf6efe2bd~mv2.png', file: 'wat-paknam-emerald-pagoda.jpg' },
  3: { id: '516253_9636ac7001814290a2f09ccc0dc4d351~mv2.jpg', file: 'wat-paknam-golden-buddha.jpg' },
  7: { id: '516253_ddee51d95fe64669bc5e1fb6d9392b75~mv2.jpg', file: 'tichuca-terrace.jpg' },
  8: { id: '516253_d4140c6e482946c28174e15470ccbf2d~mv2.jpg', file: 'tichuca-sunset.jpg' },
  10: { id: '516253_1de3482ca02546798e5eccb8e818e82e~mv2.png', file: 'tuktuk-night.jpg' },
  11: { id: '516253_2e1378d38ee5438a967263535fd0747b~mv2.png', file: 'tuktuk-black-white.jpg' },
  14: { id: '516253_0347237fe27b4f82b9d86a5dc753581e~mv2.png', file: 'chinatown-street-food.jpg' },
  15: { id: '516253_23e4b08a4c8146d0a9910fa0278a02a4~mv2.png', file: 'chinatown-food-stall.jpg' },
  22: { id: '516253_c18996615947453a91c2521b1f3296cb~mv2.png', file: 'pad-krapao.jpg' },
  24: { id: '516253_efefb961182540a69de41f885cd2f5e3~mv2.png', file: 'tamarind-prawns.jpg' },
  25: { id: '516253_4d2f2106d56243259385ee48d193f53e~mv2.png', file: 'khao-san-crowd.jpg' },
  26: { id: '516253_7739ea3588fd4078b61e523c400809a3~mv2.png', file: 'khao-san-cocktails.jpg' },
  27: { id: '516253_9ef6a6b23e0a471e86d311ab990440de~mv2.png', file: 'khao-san-neon.jpg' },
  31: { id: '516253_a79bf06fb0aa48fdaf20dc1b61d8228d~mv2.png', file: 'bang-kachao-boat.jpg' },
  32: { id: '516253_04b5334fe76c4dce9ec2fed1cc089950~mv2.png', file: 'bang-kachao-bike.jpg' },
  33: { id: '516253_19234ce0b9a94c7fb3a6d52f6bbf9b25~mv2.png', file: 'bang-kachao-coconut-lane.jpg' },
};

const numbers = process.argv.slice(2).map(Number);
if (numbers.length === 0 || numbers.some((n) => !PHOTOS[n])) {
  console.error(`Usage: node scripts/fetch-wix-photos.ts <numbers>; known: ${Object.keys(PHOTOS).join(' ')}`);
  process.exit(1);
}

for (const n of numbers) {
  const { id, file } = PHOTOS[n];
  const target = join('src/assets/photos/bangkok', file);
  await savePhoto(await download(`https://static.wixstatic.com/media/${id}`), target);
  console.log(`${n} -> ${target}`);
}
