const query = process.argv.slice(2).join(' ');
if (!query) {
  console.error('Usage: node scripts/find-commons-photos.ts <search words>');
  process.exit(1);
}

const ALLOWED = /^(cc0|public domain|cc by(-sa)? [234]\.0)/i;
const url = new URL('https://commons.wikimedia.org/w/api.php');
const params: Record<string, string> = {
  action: 'query', format: 'json', generator: 'search', gsrsearch: `filetype:bitmap ${query}`, gsrnamespace: '6',
  gsrlimit: '25', prop: 'imageinfo', iiprop: 'url|size|extmetadata', iiurlwidth: '2000',
};
for (const [key, value] of Object.entries(params)) url.searchParams.set(key, value);

interface ImageInfo { thumburl: string; width: number; height: number; descriptionurl: string; extmetadata: Record<string, { value: string } | undefined> }
const response = await fetch(url, { headers: { 'User-Agent': 'thailand-vibes/0.1 (personal travel blog)' } });
const data = (await response.json()) as { query?: { pages: Record<string, { title: string; imageinfo?: ImageInfo[] }> } };

for (const page of Object.values(data.query?.pages ?? {})) {
  const info = page.imageinfo?.[0];
  if (!info) continue;
  const license = info.extmetadata.LicenseShortName?.value ?? '';
  if (!ALLOWED.test(license) || info.width < 1200) continue;
  const author = (info.extmetadata.Artist?.value ?? 'unknown').replace(/<[^>]+>/g, '').trim();
  console.log([
    page.title,
    `  ${info.width}x${info.height}, ${license}, ${author}`,
    `  page:    ${info.descriptionurl}`,
    `  file:    ${info.thumburl}`,
    `  license: ${info.extmetadata.LicenseUrl?.value ?? '(none)'}`,
    '',
  ].join('\n'));
}
