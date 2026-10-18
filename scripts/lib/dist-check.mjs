import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** @param {string} html @returns {string[]} */
export function extractInternalUrls(html) {
  const urls = new Set();
  /** @param {string} url */
  const add = (url) => {
    if (url.startsWith('/') && !url.startsWith('//')) urls.add(url);
  };
  for (const match of html.matchAll(/\s(?:href|src)="([^"]+)"/g)) add(match[1]);
  for (const match of html.matchAll(/\ssrcset="([^"]+)"/g)) {
    for (const part of match[1].split(',')) add(part.trim().split(/\s+/)[0]);
  }
  return [...urls];
}

/** @param {string} distDir @param {string} url @returns {string | null} */
export function targetFile(distDir, url) {
  const path = decodeURIComponent(url.split(/[?#]/)[0]);
  const full = join(distDir, path);
  const index = join(full, 'index.html');
  if (path.endsWith('/')) return existsSync(index) ? index : null;
  if (existsSync(full) && statSync(full).isFile()) return full;
  return existsSync(index) ? index : null;
}

/** @param {string} distDir @param {string} url @returns {boolean} */
export function anchorExists(distDir, url) {
  const hash = url.split('#')[1];
  if (!hash) return true;
  const file = targetFile(distDir, url);
  const escaped = hash.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
  return file !== null && new RegExp(`\\sid="${escaped}"`).test(readFileSync(file, 'utf8'));
}

/** @param {string} text @returns {string[]} */
export function findPlaceholders(text) {
  return [...text.matchAll(/\[[A-ZÄÖÜ][A-ZÄÖÜ \-]{2,}\]/g)].map((match) => match[0]);
}
