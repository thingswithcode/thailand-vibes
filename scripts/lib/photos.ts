import { mkdirSync } from 'node:fs';
import { dirname } from 'node:path';
import sharp from 'sharp';

const USER_AGENT = 'thailand-vibes/0.1 (personal travel blog)';

export async function download(url: string): Promise<Buffer> {
  const response = await fetch(url, { headers: { 'User-Agent': USER_AGENT } });
  if (!response.ok) throw new Error(`${url}: HTTP ${response.status}`);
  return Buffer.from(await response.arrayBuffer());
}

// Turns the photo upright, shrinks it to at most 2400 px, saves it as JPEG and drops all metadata (incl. GPS).
export async function savePhoto(input: Buffer, target: string): Promise<void> {
  mkdirSync(dirname(target), { recursive: true });
  await sharp(input)
    .rotate()
    .resize({ width: 2400, height: 2400, fit: 'inside', withoutEnlargement: true })
    .jpeg({ quality: 85, mozjpeg: true })
    .toFile(target);
}
