import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { BASE } from '../site.config.mjs';
import { anchorExists, extractInternalUrls, findPlaceholders, stripBase, targetFile } from './lib/dist-check.mjs';

const dist = 'dist';
const strict = process.argv.includes('--strict');

function htmlFiles(dir) {
  return readdirSync(dir).flatMap((name) => {
    const path = join(dir, name);
    if (statSync(path).isDirectory()) return htmlFiles(path);
    return name.endsWith('.html') ? [path] : [];
  });
}

const problems = [];
for (const file of htmlFiles(dist)) {
  const html = readFileSync(file, 'utf8');
  const page = relative(dist, file);
  for (const url of extractInternalUrls(html)) {
    const local = stripBase(url, BASE);
    if (local === null || targetFile(dist, local) === null) problems.push(`${page}: broken link ${url}`);
    else if (!anchorExists(dist, local)) problems.push(`${page}: missing anchor ${url}`);
  }
  if (strict) for (const placeholder of findPlaceholders(html)) problems.push(`${page}: placeholder ${placeholder}`);
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`dist check ok${strict ? ' (strict)' : ''}`);
