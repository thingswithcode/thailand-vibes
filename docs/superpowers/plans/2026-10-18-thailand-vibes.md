# Thailand Vibes Umsetzungsplan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Den alten Wix-Blog "Thailand Vibes" als schnelle, zweisprachige Astro-Seite (EN/DE) im abgestimmten Magazin-Look neu bauen, mit Filter, Karten und allen Bangkok-Inhalten, und kostenlos bei Cloudflare veröffentlichen.

**Architecture:** Statische Astro-Seite. Inhalte liegen als Markdown-Dateien pro Sprache in Content Collections und werden beim Bau gegen ein Zod-Schema und eine eigene Sprachen-Konsistenzprüfung validiert. Interaktivität (Filter, Kartensynchronisation, Menü) steckt in kleinen TypeScript-Modulen, die über DOM-Events (`tv:filter`, `tv:active`) zusammenarbeiten; die Ortskarte lädt MapLibre erst bei Bedarf, die Thailand-Übersicht ist ein beim Bau berechnetes SVG.

**Tech Stack:** Astro 7.4, TypeScript 6, MapLibre GL 6 mit OpenFreeMap, d3-geo + topojson-client + world-atlas (Natural Earth 1:50m), Fontsource (Fraunces, Inter), sharp (Fotos), Vitest 5, Playwright 1.64, Wrangler 4 (Cloudflare).

**Spec:** `docs/superpowers/specs/2026-10-18-thailand-vibes-design.md` (Vorlagen: `docs/superpowers/mockups/startseite.html`, `docs/superpowers/mockups/bangkok.html`, `docs/superpowers/mockups/handy/*.jpg`)

## Global Constraints

- Node `>=22.22.0` (lokal ist 25.x installiert). Astro `^7.4.0`. TypeScript `^6` (nicht 7: `@astrojs/check` 0.9.10 verlangt `^5 || ^6`).
- Keine UI-Bibliothek (kein React o. Ä.). Interaktive Teile sind TypeScript-Module unter `src/scripts/`.
- Farben: bg `#F2EBDD`, ink `#2A211B`, red `#A63A2B`, card `#FBF7EF`, muted `#6B5D50` (statt `#8A7B6C` aus dem Entwurf, weil `#8A7B6C` auf Creme nur 3,45:1 Kontrast hat; `#6B5D50` hat 5,35:1), sand `#E7DCC8`, skip `#E08A6E`.
- Schriften: Fraunces und Inter, selbst gehostet über Fontsource. Keine Anfrage an Google Fonts.
- Kein Tracking, keine Cookies, keine Formulare.
- Alle Schriftgrößen mit `clamp()`, Bilder nur mit Seitenverhältnis, nie mit fester Höhe. Umbruch auf einspaltig unter 900 px.
- Adressen: `/en/...` und `/de/...`, immer mit Schrägstrich am Ende. Gleiche Pfade in beiden Sprachen.
- Kartenstil: `https://tiles.openfreemap.org/styles/positron`. Nie die Kachelserver von OpenStreetMap selbst.
- MapLibre 6 findet seinen Worker im Bundle nicht von allein: immer `setWorkerUrl()` mit `import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url'` aufrufen.
- Texte stammen von der Autorin und werden nur gekürzt, nicht umgeschrieben. Deutsch in der Du-Form. Keine Gedankenstriche (Zeichen U+2014) in Texten.
- Fotos: nur eigene Fotos der Autorin (nach Freigabe) oder freie Lizenzen mit Fotografen-Angabe. Fotos mit erkennbaren Personen (Wix-Nr. 26, 31, 32) nur mit Einverständnis.
- Arbeitsbranch `umsetzung` im Repo `~/Code/thailand-vibes`. Jede Commit-Nachricht endet mit:
  `Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>`

## Review Focus

1. Lange deutsche Wörter und Titel auf 390 px Breite ("Wochenendtrips ab Bangkok", "Gönn dir eine Massage"): Die Seite darf nie seitlich scrollen, Überschriften brechen mit Silbentrennung um. Test: Task 7, `responsive.spec.ts` prüft alle Seiten in beiden Sprachen auf dem Handy.
2. Filter auf eine Kategorie ohne Kartenpunkte (Wellness, Getting around): Die Karte behält ihren Ausschnitt, es gibt keinen Skriptfehler. Test: Task 5, `map.spec.ts`.
3. Karte nicht verfügbar (OpenFreeMap nicht erreichbar, kein WebGL): Alle Tipps bleiben lesbar, keine Skriptfehler, die Kartenfläche bleibt ruhig. Test: Task 5, `map.spec.ts`.
4. Seiten, die es nur in einer Sprache gibt (Impressum, Datenschutz), und Sprunglinks auf `#tip-...`: Sprachumschalter und Links führen nie auf eine 404-Seite oder einen fehlenden Anker. Tests: Task 9 (`text-pages.spec.ts`) und Task 10 (Anker-Prüfung in `check-dist`).
5. Bedienung nur mit der Tastatur: Filter-Chips und Kartenpins sind erreichbar, per Enter/Leertaste auslösbar und der Fokus ist sichtbar. Tests: Task 4 (`place.spec.ts`), Task 5 (`map.spec.ts`).

## Vorab geprüft (18.10.2026, Wegwerf-Projekt)

- Astro 7.4.0: `defineCollection` + `glob()` aus `astro/loaders` + `z` aus `astro/zod` + `image()` im Schema funktionieren; Einträge heißen `en/<datei>`; `render(entry)` liefert `Content`; `getRelativeLocaleUrl` existiert; mit `prefixDefaultLocale: true, redirectToDefaultLocale: true` erzeugt der Bau `dist/index.html` mit Weiterleitung auf `/en/`. `<Picture formats={['avif','webp']}>` erzeugt `srcset` und vergrößert nie über das Original hinaus.
- Astro 7 nutzt `compressHTML: 'jsx'`: Leerzeichen zwischen Inline-Elementen können verschwinden. Wo ein Leerzeichen nötig ist, `{' '}` schreiben.
- MapLibre 6.14: ohne `setWorkerUrl` meldet die Karte "Worker failed to load" und bleibt grau; mit `?url`-Import und `setWorkerUrl` lädt sie (geprüft im Browser).
- world-atlas `countries-50m.json`: Thailand (id `764`) enthält Koh Phangan, Koh Samui und Phuket; der SVG-Pfad ist bei 360 × 620 und 1 Nachkommastelle etwa 6 KB groß; Bangkok landet bei etwa (139, 284).
- Koordinaten aus den Google-Maps-Links der Autorin sind aufgelöst (siehe Inhalte in Task 2). Für 4 von 8 Restaurants gibt es Koordinaten aus OpenStreetMap; für The Local, Shamballa Somtam, Baan Suan Sathon und Supanniga Tha Tian fehlen sie (Task 8, Schritt 1).

## Dateistruktur

```
astro.config.mjs, tsconfig.json, package.json, vitest.config.ts, playwright.config.ts, wrangler.jsonc
public/favicon.svg, public/_redirects, public/_headers
src/i18n/types.ts            Sprachen, Kategorien, Regionen, Küchen, Dict-Typ, NavKey
src/i18n/en.ts, de.ts         Oberflächentexte
src/i18n/index.ts             t(lang)
src/lib/urls.ts               pathFor, otherLang, isLang, langPaths
src/lib/ids.ts                splitId
src/lib/content-checks.ts     reine Prüflogik für Inhalte (Sprachpaare, Referenzen)
src/lib/content.ts            Lade-Funktionen über astro:content, ruft die Prüfung auf
src/lib/categories.ts         countOptions, matchesFilter, FilterOption
src/lib/active.ts             pickActive (welche Karte ist gerade "dran")
src/lib/map-helpers.ts        MapPin, toLngLat, boundsOf, labelField, pinLabel
src/lib/geo.ts                thailandShape (SVG-Umriss + Projektion)
src/lib/maps-link.ts          parseMapsUrl (Google-Maps-Links auslesen)
src/scripts/menu.ts, filter.ts, scroll-active.ts, place-map.ts, motion.ts
src/styles/global.css
src/layouts/BaseLayout.astro
src/components/Header, Footer, ArchPhoto, FilterBar, TipCard, PlaceMap, ThailandMap,
               PlaceCard, WhereToGo, SkipBlock, EverywhereTiles, RestaurantCard (.astro)
src/data/home.ts              Fotos für die Startseite
src/content.config.ts
src/content/{places,tips,restaurants,skips,pages}/{en,de}/*.md
src/assets/photos/bangkok/*.jpg
src/pages/[lang]/index.astro, all-over-thailand.astro, [page].astro
src/pages/[lang]/destinations/index.astro
src/pages/[lang]/destinations/[place]/index.astro, food.astro
src/pages/404.astro
scripts/resolve-maps-link.ts, fetch-wix-photos.ts, fetch-photo.ts, find-commons-photos.ts
scripts/lib/photos.ts, scripts/lib/dist-check.mjs, scripts/check-dist.mjs
tests/unit/*.test.ts, tests/e2e/*.spec.ts, tests/e2e/helpers.ts
```

---

### Task 1: Grundgerüst, Sprachen und Seitenrahmen

**Files:**
- Create: `package.json`, `astro.config.mjs`, `tsconfig.json`, `vitest.config.ts`, `playwright.config.ts`, `.claude/launch.json`, `public/favicon.svg`
- Create: `src/i18n/types.ts`, `src/i18n/en.ts`, `src/i18n/de.ts`, `src/i18n/index.ts`, `src/lib/urls.ts`
- Create: `src/styles/global.css`, `src/layouts/BaseLayout.astro`, `src/components/Header.astro`, `src/components/Footer.astro`, `src/scripts/menu.ts`
- Create: `src/pages/[lang]/index.astro` (vorläufige Startseite, wird in Task 7 ersetzt)
- Modify: `.gitignore`
- Test: `tests/unit/urls.test.ts`, `tests/e2e/helpers.ts`, `tests/e2e/layout.spec.ts`

**Interfaces:**
- Produces: `LANGS`, `Lang`, `CATEGORIES`, `Category`, `REGIONS`, `Region`, `CUISINES`, `Cuisine`, `NavKey`, `Dict` aus `src/i18n/types.ts`; `t(lang: Lang): Dict` aus `src/i18n/index.ts`; `pathFor(lang: Lang, path?: string): string`, `otherLang(lang: Lang): Lang`, `isLang(value: unknown): value is Lang`, `langPaths()` aus `src/lib/urls.ts`; `BaseLayout` mit Props `{ lang: Lang; path: string; title?: string; description?: string; onlyLangs?: readonly Lang[]; current?: NavKey; noindex?: boolean }`; Helfer `collectPageErrors(page)` und `expectNoHorizontalScroll(page)` aus `tests/e2e/helpers.ts`; globale CSS-Klassen `.wrap`, `.label`, `.serif`, `.btn`, `.btn-ghost`, `.sec-head`, `.page-head`, `.page-title`, `.lead`, `.visually-hidden`, `.tv-pin`.

- [ ] **Step 1: Branch anlegen und Paket-Grundlage schreiben**

```bash
cd ~/Code/thailand-vibes && git switch -c umsetzung
```

`package.json`:

```json
{
  "name": "thailand-vibes",
  "type": "module",
  "version": "0.1.0",
  "private": true,
  "engines": { "node": ">=22.22.0" },
  "scripts": {
    "dev": "astro dev",
    "build": "astro build",
    "preview": "astro preview",
    "check": "astro check",
    "test": "vitest run",
    "test:e2e": "playwright test",
    "verify": "npm run check && npm test && npm run build && npm run test:e2e"
  }
}
```

- [ ] **Step 2: Abhängigkeiten installieren**

```bash
cd ~/Code/thailand-vibes
npm i astro@^7.4.0 @fontsource-variable/fraunces@^5.3.0 @fontsource-variable/inter@^5.3.0
npm i -D @astrojs/check@^0.9.10 typescript@^6 vitest@^5.0.5 @playwright/test@^1.64.1 @types/node@^24
npx playwright install chromium
```

Expected: keine `ERESOLVE`-Fehler. `npx astro --version` zeigt 7.4.x.

- [ ] **Step 3: Konfiguration schreiben**

`astro.config.mjs`:

```js
// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  trailingSlash: 'always',
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'de'],
    routing: { prefixDefaultLocale: true, redirectToDefaultLocale: true },
  },
});
```

`tsconfig.json`:

```json
{
  "extends": "astro/tsconfigs/strict",
  "include": [".astro/types.d.ts", "**/*"],
  "exclude": ["dist", "scripts"]
}
```

`vitest.config.ts`:

```ts
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: { include: ['tests/unit/**/*.test.ts'], environment: 'node' },
});
```

`playwright.config.ts`:

```ts
import { defineConfig, devices } from '@playwright/test';

const external = process.env.TV_BASE_URL;
const launchOptions = { args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'] };

export default defineConfig({
  testDir: 'tests/e2e',
  fullyParallel: true,
  reporter: 'list',
  use: { baseURL: external ?? 'http://localhost:4330', launchOptions },
  webServer: external
    ? undefined
    : { command: 'npx astro preview --port 4330', url: 'http://localhost:4330/en/', reuseExistingServer: true, timeout: 60_000 },
  projects: [
    { name: 'desktop', use: { ...devices['Desktop Chrome'], viewport: { width: 1920, height: 1080 }, launchOptions } },
    { name: 'mobile', use: { ...devices['Pixel 7'], viewport: { width: 390, height: 844 }, launchOptions } },
  ],
});
```

`.claude/launch.json` (für die Browser-Vorschau in Claude Code):

```json
{
  "version": "0.0.1",
  "configurations": [
    { "name": "tv-dev", "runtimeExecutable": "npm", "runtimeArgs": ["run", "dev", "--", "--port", "4321"], "port": 4321 },
    { "name": "tv-preview", "runtimeExecutable": "bash", "runtimeArgs": ["-c", "npm run build && npx astro preview --port 4331"], "port": 4331 }
  ]
}
```

An `.gitignore` anhängen:

```
.claude/launch.json
test-results/
playwright-report/
.lighthouse/
```

`public/favicon.svg`:

```svg
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64"><path d="M8 60V30a24 24 0 0 1 48 0v30z" fill="#A63A2B"/><text x="32" y="50" text-anchor="middle" font-family="Georgia, serif" font-style="italic" font-size="24" fill="#F2EBDD">TV</text></svg>
```

- [ ] **Step 4: Failing Unit-Test für die Adress-Helfer schreiben**

`tests/unit/urls.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { isLang, langPaths, otherLang, pathFor } from '../../src/lib/urls';

describe('pathFor', () => {
  it('builds the home page of a language', () => {
    expect(pathFor('en')).toBe('/en/');
    expect(pathFor('de', '')).toBe('/de/');
  });

  it('adds a trailing slash and strips leading slashes', () => {
    expect(pathFor('en', 'destinations')).toBe('/en/destinations/');
    expect(pathFor('de', '/destinations/bangkok/')).toBe('/de/destinations/bangkok/');
  });
});

describe('language helpers', () => {
  it('switches between the two languages', () => {
    expect(otherLang('en')).toBe('de');
    expect(otherLang('de')).toBe('en');
  });

  it('accepts only known languages', () => {
    expect(isLang('de')).toBe(true);
    expect(isLang('fr')).toBe(false);
    expect(isLang(undefined)).toBe(false);
  });

  it('lists one static path per language', () => {
    expect(langPaths()).toEqual([{ params: { lang: 'en' } }, { params: { lang: 'de' } }]);
  });
});
```

- [ ] **Step 5: Test laufen lassen, er muss scheitern**

Run: `npx vitest run tests/unit/urls.test.ts`
Expected: FAIL, "Failed to resolve import ../../src/lib/urls".

- [ ] **Step 6: Sprachtypen, Wörterbücher und Adress-Helfer schreiben**

`src/i18n/types.ts`:

```ts
export const LANGS = ['en', 'de'] as const;
export type Lang = (typeof LANGS)[number];

export const CATEGORIES = [
  'temples', 'markets', 'rooftops', 'food', 'drinks', 'shopping',
  'nightlife', 'wellness', 'nature', 'getting-around', 'etiquette',
] as const;
export type Category = (typeof CATEGORIES)[number];

export const REGIONS = ['capital', 'islands', 'north', 'weekend-trips'] as const;
export type Region = (typeof REGIONS)[number];

export const CUISINES = ['thai', 'brunch', 'italian', 'mediterranean', 'japanese'] as const;
export type Cuisine = (typeof CUISINES)[number];

export type NavKey = 'destinations' | 'all-over-thailand' | 'before-you-come' | 'about';

export interface Dict {
  meta: { siteName: string; description: string };
  nav: {
    main: string; destinations: string; allOverThailand: string; beforeYouCome: string; about: string;
    menu: string; home: string; skipToContent: string; switchLanguage: string;
  };
  footer: { label: string; imprint: string; privacy: string };
  home: {
    kicker: string; titleMain: string; titleAccent: string;
    welcomeLabel: string; welcomeTitle: string; welcomeText: string;
    destinationsLabel: string; destinationsTitle: string; destinationsLead: string;
    everywhereLabel: string; everywhereTitle: string; everywhereLead: string; everywhereMore: string;
  };
  skip: { label: string; titleStart: string; titleAccent: string; instead: (name: string) => string };
  destinations: { label: string; title: string; lead: string; mapLabel: string };
  place: {
    breadcrumb: string; tipsCount: (n: number) => string; allTips: (n: number) => string;
    openInMaps: string; openNamedInMaps: (name: string) => string; iWouldSkip: string; mapLabel: string;
  };
  everywhere: { label: string; title: string; lead: string };
  food: { label: string; title: (place: string) => string; lead: (place: string) => string; price: string; mapLabel: string };
  filter: { label: string; all: string };
  categories: Record<Category, string>;
  category: Record<Category, string>;
  regions: Record<Region, string>;
  cuisines: Record<Cuisine, string>;
  photo: { label: string };
}
```

`src/i18n/en.ts`:

```ts
import type { Dict } from './types';

export const en: Dict = {
  meta: {
    siteName: 'Thailand Vibes',
    description: 'Insider tips for Thailand from Bangkok: where to go, what we recommend everywhere and what we would skip.',
  },
  nav: {
    main: 'Main', destinations: 'Destinations', allOverThailand: 'All over Thailand', beforeYouCome: 'Before you come',
    about: 'About', menu: 'Menu', home: 'Thailand Vibes home', skipToContent: 'Skip to content', switchLanguage: 'Deutsch',
  },
  footer: { label: 'Footer', imprint: 'Impressum', privacy: 'Datenschutz' },
  home: {
    kicker: 'Insider tips from Bangkok',
    titleMain: 'Thailand',
    titleAccent: 'Vibes',
    welcomeLabel: 'Welcome',
    welcomeTitle: 'This is your first time to Thailand or you have been here multiple times? No worries, we got you!',
    welcomeText: "From the well-known to remote places, you'll find all of it right here: what we recommend in every destination, what we recommend all over Thailand, and the places we would honestly skip.",
    destinationsLabel: 'Destinations',
    destinationsTitle: 'Where to go',
    destinationsLead: "Destinations you should not miss in Thailand, and what we recommend once you're there.",
    everywhereLabel: 'All over Thailand',
    everywhereTitle: 'What we recommend everywhere',
    everywhereLead: 'The things that work in every corner of the country, from the street food stall to the temple door.',
    everywhereMore: 'All tips for all over Thailand →',
  },
  skip: {
    label: 'Honest opinion',
    titleStart: 'Hyped, but I would',
    titleAccent: 'totally skip',
    instead: (name) => `Go to ${name} instead →`,
  },
  destinations: {
    label: 'Destinations',
    title: 'Destinations you should not miss',
    lead: "This is your first time to Thailand or you have been here multiple times? From the well-known to remote places, you'll find all of it right here.",
    mapLabel: 'Map of Thailand with all destinations',
  },
  place: {
    breadcrumb: 'Destinations',
    tipsCount: (n) => `${n} tips`,
    allTips: (n) => `All ${n} tips →`,
    openInMaps: 'Open in Google Maps ↗',
    openNamedInMaps: (name) => `${name} on Google Maps ↗`,
    iWouldSkip: 'I would skip',
    mapLabel: 'Map with all tips',
  },
  everywhere: {
    label: 'All over Thailand',
    title: 'What we recommend everywhere',
    lead: 'The things that work in every corner of the country, from the street food stall to the temple door.',
  },
  food: {
    label: 'Where to eat',
    title: (place) => `Food & drinks in ${place}`,
    lead: (place) => `${place} has so much to offer on the cuisine side, and here are my favorite spots.`,
    price: 'Price',
    mapLabel: 'Map with all restaurants',
  },
  filter: { label: 'Filter by category', all: 'All' },
  categories: {
    temples: 'Temples', markets: 'Markets', rooftops: 'Rooftops', food: 'Food', drinks: 'Drinks', shopping: 'Shopping',
    nightlife: 'Nightlife', wellness: 'Wellness', nature: 'Nature', 'getting-around': 'Getting around', etiquette: 'Etiquette',
  },
  category: {
    temples: 'Temple', markets: 'Market', rooftops: 'Rooftop', food: 'Food', drinks: 'Drinks', shopping: 'Shopping',
    nightlife: 'Nightlife', wellness: 'Wellness', nature: 'Nature', 'getting-around': 'Getting around', etiquette: 'Etiquette',
  },
  regions: { capital: 'The capital', islands: 'My top islands', north: 'The beautiful north', 'weekend-trips': 'Weekend trips from Bangkok' },
  cuisines: { thai: 'Thai food', brunch: 'Brunch', italian: 'Italian', mediterranean: 'Mediterranean', japanese: 'Japanese' },
  photo: { label: 'Photo' },
};
```

`src/i18n/de.ts`:

```ts
import type { Dict } from './types';

export const de: Dict = {
  meta: {
    siteName: 'Thailand Vibes',
    description: 'Insider-Tipps für Thailand aus Bangkok: wohin es geht, was wir überall empfehlen und was wir auslassen würden.',
  },
  nav: {
    main: 'Hauptmenü', destinations: 'Destinationen', allOverThailand: 'Ganz Thailand', beforeYouCome: 'Vor der Reise',
    about: 'Über uns', menu: 'Menü', home: 'Thailand Vibes Startseite', skipToContent: 'Zum Inhalt springen', switchLanguage: 'English',
  },
  footer: { label: 'Fußbereich', imprint: 'Impressum', privacy: 'Datenschutz' },
  home: {
    kicker: 'Insider-Tipps aus Bangkok',
    titleMain: 'Thailand',
    titleAccent: 'Vibes',
    welcomeLabel: 'Willkommen',
    welcomeTitle: 'Zum ersten Mal in Thailand oder schon zum x-ten Mal hier? Keine Sorge, wir haben was für dich!',
    welcomeText: 'Von bekannten bis zu abgelegenen Orten findest du hier alles: was wir in jeder Destination empfehlen, was wir in ganz Thailand empfehlen und welche Orte wir ehrlich gesagt auslassen würden.',
    destinationsLabel: 'Destinationen',
    destinationsTitle: 'Wohin die Reise geht',
    destinationsLead: 'Destinationen, die du in Thailand nicht verpassen solltest, und was wir dir dort empfehlen.',
    everywhereLabel: 'Ganz Thailand',
    everywhereTitle: 'Was wir überall empfehlen',
    everywhereLead: 'Was in jeder Ecke des Landes funktioniert, vom Streetfood-Stand bis zur Tempeltür.',
    everywhereMore: 'Alle Tipps für ganz Thailand →',
  },
  skip: {
    label: 'Ehrliche Meinung',
    titleStart: 'Gehypt, aber ich würde es',
    titleAccent: 'komplett auslassen',
    instead: (name) => `Stattdessen: ${name} →`,
  },
  destinations: {
    label: 'Destinationen',
    title: 'Destinationen, die du nicht verpassen solltest',
    lead: 'Zum ersten Mal in Thailand oder schon zum x-ten Mal hier? Von bekannten bis zu abgelegenen Orten findest du hier alles.',
    mapLabel: 'Thailandkarte mit allen Destinationen',
  },
  place: {
    breadcrumb: 'Destinationen',
    tipsCount: (n) => `${n} Tipps`,
    allTips: (n) => `Alle ${n} Tipps →`,
    openInMaps: 'In Google Maps öffnen ↗',
    openNamedInMaps: (name) => `${name} in Google Maps ↗`,
    iWouldSkip: 'Würde ich auslassen',
    mapLabel: 'Karte mit allen Tipps',
  },
  everywhere: {
    label: 'Ganz Thailand',
    title: 'Was wir überall empfehlen',
    lead: 'Was in jeder Ecke des Landes funktioniert, vom Streetfood-Stand bis zur Tempeltür.',
  },
  food: {
    label: 'Wo essen',
    title: (place) => `Essen & Trinken in ${place}`,
    lead: (place) => `${place} hat kulinarisch so viel zu bieten, hier sind meine Lieblingsorte.`,
    price: 'Preis',
    mapLabel: 'Karte mit allen Restaurants',
  },
  filter: { label: 'Nach Kategorie filtern', all: 'Alle' },
  categories: {
    temples: 'Tempel', markets: 'Märkte', rooftops: 'Rooftops', food: 'Essen', drinks: 'Getränke', shopping: 'Shopping',
    nightlife: 'Nachtleben', wellness: 'Wellness', nature: 'Natur', 'getting-around': 'Unterwegs', etiquette: 'Etikette',
  },
  category: {
    temples: 'Tempel', markets: 'Markt', rooftops: 'Rooftop', food: 'Essen', drinks: 'Getränke', shopping: 'Shopping',
    nightlife: 'Nachtleben', wellness: 'Wellness', nature: 'Natur', 'getting-around': 'Unterwegs', etiquette: 'Etikette',
  },
  regions: { capital: 'Die Hauptstadt', islands: 'Meine Top-Inseln', north: 'Der schöne Norden', 'weekend-trips': 'Wochenendtrips ab Bangkok' },
  cuisines: { thai: 'Thailändisch', brunch: 'Brunch', italian: 'Italienisch', mediterranean: 'Mediterran', japanese: 'Japanisch' },
  photo: { label: 'Foto' },
};
```

`src/i18n/index.ts`:

```ts
import { de } from './de';
import { en } from './en';
import type { Dict, Lang } from './types';

const dicts: Record<Lang, Dict> = { en, de };

export function t(lang: Lang): Dict {
  return dicts[lang];
}
```

`src/lib/urls.ts`:

```ts
import { LANGS, type Lang } from '../i18n/types';

export function pathFor(lang: Lang, path = ''): string {
  const clean = path.replace(/^\/+/, '');
  if (clean === '') return `/${lang}/`;
  return `/${lang}/${clean.endsWith('/') ? clean : `${clean}/`}`;
}

export function otherLang(lang: Lang): Lang {
  return lang === 'en' ? 'de' : 'en';
}

export function isLang(value: unknown): value is Lang {
  return typeof value === 'string' && (LANGS as readonly string[]).includes(value);
}

export function langPaths(): { params: { lang: Lang } }[] {
  return LANGS.map((lang) => ({ params: { lang } }));
}
```

- [ ] **Step 7: Unit-Test laufen lassen, er muss bestehen**

Run: `npx vitest run tests/unit/urls.test.ts`
Expected: PASS (5 Tests).

- [ ] **Step 8: Failing E2E-Tests für den Seitenrahmen schreiben**

`tests/e2e/helpers.ts`:

```ts
import { expect, type Page } from '@playwright/test';

export function collectPageErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('pageerror', (error) => errors.push(error.message));
  return errors;
}

export async function expectNoHorizontalScroll(page: Page): Promise<void> {
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow, 'the page must not scroll sideways').toBeLessThanOrEqual(0);
}
```

`tests/e2e/layout.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('the root address forwards to the English home page', async ({ page }) => {
  await page.goto('/');
  await page.waitForURL('**/en/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'en');
});

test('the language switch leads to the same page in German and back', async ({ page }) => {
  await page.goto('/en/');
  await page.getByRole('banner').getByRole('link', { name: 'Deutsch' }).click();
  await expect(page).toHaveURL(/\/de\/$/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await page.getByRole('banner').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
});

test('desktop shows the main navigation without a menu button', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'desktop only');
  await page.goto('/en/');
  await expect(page.getByRole('navigation', { name: 'Main' }).getByRole('link', { name: 'Destinations' })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Menu' })).toBeHidden();
});

test('the mobile menu opens, closes with Escape and hands focus back', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile only');
  await page.goto('/de/');
  const button = page.getByRole('button', { name: 'Menü' });
  const nav = page.locator('#site-nav');
  await expect(nav).toBeHidden();
  await button.click();
  await expect(nav).toBeVisible();
  await expect(button).toHaveAttribute('aria-expanded', 'true');
  await page.keyboard.press('Escape');
  await expect(nav).toBeHidden();
  await expect(button).toBeFocused();
});
```

- [ ] **Step 9: Globales CSS, Layout, Kopf- und Fußbereich schreiben**

`src/styles/global.css`:

```css
:root {
  --bg: #f2ebdd;
  --ink: #2a211b;
  --red: #a63a2b;
  --card: #fbf7ef;
  --muted: #6b5d50;
  --sand: #e7dcc8;
  --skip: #e08a6e;
  --line: rgb(42 33 27 / 0.14);
  --pad: clamp(18px, 4vw, 64px);
  --maxw: 1480px;
  --radius: 18px;
  --serif: 'Fraunces Variable', Georgia, serif;
  --sans: 'Inter Variable', system-ui, sans-serif;
  color-scheme: light;
}

*, *::before, *::after { box-sizing: border-box; }
html { -webkit-text-size-adjust: 100%; scroll-behavior: smooth; }
body { margin: 0; background: var(--bg); color: var(--ink); font-family: var(--sans); font-size: 16px; line-height: 1.6; }
h1, h2, h3, h4 { overflow-wrap: break-word; hyphens: auto; }
img { display: block; max-width: 100%; height: auto; }
a { color: inherit; }
[hidden] { display: none !important; }
:focus-visible { outline: 2px solid var(--red); outline-offset: 3px; }

.wrap { max-width: var(--maxw); margin: 0 auto; padding-left: var(--pad); padding-right: var(--pad); }
.label { font-size: clamp(11px, 0.8vw, 13px); letter-spacing: 0.16em; text-transform: uppercase; color: var(--red); font-weight: 600; }
.serif { font-family: var(--serif); font-weight: 300; }
.visually-hidden { position: absolute; width: 1px; height: 1px; padding: 0; margin: -1px; overflow: hidden; clip: rect(0 0 0 0); white-space: nowrap; border: 0; }
.skip-link { position: absolute; left: -9999px; top: 0; z-index: 2000; background: var(--ink); color: var(--bg); padding: 10px 16px; border-radius: 0 0 12px 0; }
.skip-link:focus { left: 0; }

.btn { display: inline-block; background: var(--ink); color: var(--bg); border: 1px solid var(--ink); border-radius: 99px; padding: 10px 18px; font-size: clamp(13px, 0.9vw, 15px); line-height: 1.3; text-decoration: none; }
.btn-ghost { background: transparent; color: var(--ink); }

.sec-head { display: flex; justify-content: space-between; align-items: end; gap: 20px; border-top: 1px solid var(--line); padding-top: clamp(30px, 4vw, 70px); margin-bottom: clamp(20px, 3vw, 50px); }
.sec-head h2 { font-family: var(--serif); font-weight: 300; font-size: clamp(36px, 4.6vw, 88px); line-height: 1; margin: 12px 0 0; letter-spacing: -0.02em; }
.sec-head p { max-width: 34ch; font-size: clamp(14px, 1vw, 17px); margin: 0; color: var(--muted); }
.page-head { padding-top: clamp(16px, 3vw, 60px); padding-bottom: clamp(30px, 4vw, 70px); }
.page-title { font-family: var(--serif); font-weight: 300; font-size: clamp(44px, 7vw, 140px); line-height: 0.9; letter-spacing: -0.03em; margin: 10px 0 20px; }
.lead { font-family: var(--serif); font-weight: 300; font-size: clamp(16px, 1.3vw, 22px); line-height: 1.55; max-width: 40ch; margin: 0; }

[data-active-id].is-active { box-shadow: 0 0 0 2px var(--red); }

.tv-pin { background: none; border: 0; padding: 0; cursor: pointer; }
.tv-pin span { display: flex; align-items: center; justify-content: center; min-width: 30px; height: 30px; padding: 0 6px; border-radius: 99px; background: var(--bg); border: 2px solid var(--red); color: var(--red); font: 600 13px var(--sans); box-shadow: 0 2px 6px rgb(0 0 0 / 0.2); transition: background 0.25s, color 0.25s, transform 0.25s; }
.tv-pin.is-active span, .tv-pin:focus-visible span { background: var(--red); color: var(--bg); transform: scale(1.25); }
[data-place-map] canvas { filter: sepia(0.38) saturate(0.85) brightness(1.02); }

@media (max-width: 900px) {
  .sec-head { display: block; }
  .sec-head p { margin-top: 12px; }
}

@media (prefers-reduced-motion: reduce) {
  html { scroll-behavior: auto; }
  *, *::before, *::after { transition-duration: 0.01ms !important; animation-duration: 0.01ms !important; }
}
```

`src/scripts/menu.ts`:

```ts
export function initMenu(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-menu-button]');
  const nav = document.getElementById('site-nav');
  if (!button || !nav) return;

  const setOpen = (open: boolean) => {
    nav.dataset.open = String(open);
    button.setAttribute('aria-expanded', String(open));
  };

  button.addEventListener('click', () => setOpen(nav.dataset.open !== 'true'));
  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && nav.dataset.open === 'true') {
      setOpen(false);
      button.focus();
    }
  });
  nav.addEventListener('click', (event) => {
    if ((event.target as HTMLElement).closest('a')) setOpen(false);
  });
}
```

`src/components/Header.astro`:

```astro
---
import type { Lang, NavKey } from '../i18n/types';
import { t } from '../i18n';
import { pathFor } from '../lib/urls';

interface Props {
  lang: Lang;
  current?: NavKey;
  switchHref: string;
  otherLang: Lang;
}

const { lang, current, switchHref, otherLang } = Astro.props;
const d = t(lang);
const links: { key: NavKey; href: string; label: string }[] = [
  { key: 'destinations', href: pathFor(lang, 'destinations/'), label: d.nav.destinations },
  { key: 'all-over-thailand', href: pathFor(lang, 'all-over-thailand/'), label: d.nav.allOverThailand },
];
---
<header class="site-header wrap">
  <a class="logo" href={pathFor(lang)} aria-label={d.nav.home}>Thailand Vibes</a>
  <nav class="nav" id="site-nav" aria-label={d.nav.main} data-open="false">
    <ul>
      {links.map((link) => (
        <li><a href={link.href} aria-current={current === link.key ? 'page' : undefined}>{link.label}</a></li>
      ))}
    </ul>
  </nav>
  <div class="right">
    <a class="lang" href={switchHref} hreflang={otherLang}>
      <span aria-hidden="true"><b>{lang.toUpperCase()}</b>{' / '}{otherLang.toUpperCase()}</span>
      <span class="visually-hidden" lang={otherLang}>{d.nav.switchLanguage}</span>
    </a>
    <button class="menu-btn" type="button" data-menu-button aria-controls="site-nav" aria-expanded="false" aria-label={d.nav.menu}>☰</button>
  </div>
</header>

<script>
  import { initMenu } from '../scripts/menu';
  initMenu();
</script>

<style>
  .site-header { display: flex; align-items: center; justify-content: space-between; gap: 16px; position: relative; padding-top: clamp(14px, 1.6vw, 26px); padding-bottom: clamp(14px, 1.6vw, 26px); font-size: clamp(13px, 0.95vw, 16px); }
  .logo { font-family: var(--serif); font-style: italic; font-size: clamp(20px, 1.6vw, 28px); text-decoration: none; }
  .nav ul { display: flex; gap: clamp(16px, 2vw, 36px); list-style: none; margin: 0; padding: 0; }
  .nav a { text-decoration: none; }
  .nav a[aria-current='page'] { color: var(--red); }
  .right { display: flex; align-items: center; gap: 14px; }
  .lang { border: 1px solid var(--ink); border-radius: 99px; padding: 4px 12px; font-size: 0.85em; text-decoration: none; }
  .lang b { color: var(--red); }
  .menu-btn { display: none; background: none; border: 0; padding: 4px; font: inherit; font-size: 22px; line-height: 1; color: inherit; cursor: pointer; }
  @media (max-width: 900px) {
    .menu-btn { display: block; }
    .nav { display: none; position: absolute; top: 100%; left: 0; right: 0; z-index: 1000; background: var(--bg); border-bottom: 1px solid var(--line); padding: 8px var(--pad) 20px; }
    .nav[data-open='true'] { display: block; }
    .nav ul { flex-direction: column; gap: 14px; font-size: 18px; }
  }
</style>
```

`src/components/Footer.astro`:

```astro
---
import type { Lang } from '../i18n/types';
import { t } from '../i18n';

interface Props {
  lang: Lang;
  switchHref: string;
  otherLang: Lang;
}

const { lang, switchHref, otherLang } = Astro.props;
const d = t(lang);
---
<footer class="site-footer">
  <div class="wrap inner">
    <span class="logo">Thailand Vibes</span>
    <nav aria-label={d.footer.label}>
      <a href="/de/impressum/" hreflang="de">{d.footer.imprint}</a>
      <a href="/de/datenschutz/" hreflang="de">{d.footer.privacy}</a>
      <a href={switchHref} hreflang={otherLang} lang={otherLang}>{d.nav.switchLanguage}</a>
    </nav>
  </div>
</footer>

<style>
  .site-footer { border-top: 1px solid var(--line); margin-top: clamp(40px, 6vw, 110px); }
  .inner { display: flex; flex-wrap: wrap; justify-content: space-between; align-items: center; gap: 16px; padding-top: 28px; padding-bottom: 36px; font-size: 14px; }
  .logo { font-family: var(--serif); font-style: italic; font-size: 20px; }
  nav { display: flex; flex-wrap: wrap; gap: 20px; }
  nav a { text-decoration: none; }
  nav a:hover { text-decoration: underline; }
</style>
```

`src/layouts/BaseLayout.astro`:

```astro
---
import '@fontsource-variable/fraunces/opsz.css';
import '@fontsource-variable/fraunces/opsz-italic.css';
import '@fontsource-variable/inter';
import '../styles/global.css';
import Footer from '../components/Footer.astro';
import Header from '../components/Header.astro';
import { t } from '../i18n';
import { LANGS, type Lang, type NavKey } from '../i18n/types';
import { otherLang, pathFor } from '../lib/urls';

interface Props {
  lang: Lang;
  path: string;
  title?: string;
  description?: string;
  onlyLangs?: readonly Lang[];
  current?: NavKey;
  noindex?: boolean;
}

const { lang, path, title, description, onlyLangs = LANGS, current, noindex = false } = Astro.props;
const d = t(lang);
const other = otherLang(lang);
const switchHref = onlyLangs.includes(other) ? pathFor(other, path) : pathFor(other);
const fullTitle = title ? `${title} | ${d.meta.siteName}` : d.meta.siteName;
const site = Astro.site;
---
<!doctype html>
<html lang={lang}>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>{fullTitle}</title>
    <meta name="description" content={description ?? d.meta.description} />
    <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
    {noindex && <meta name="robots" content="noindex" />}
    {!noindex && site && <link rel="canonical" href={new URL(pathFor(lang, path), site).href} />}
    {!noindex && site && onlyLangs.map((l) => <link rel="alternate" hreflang={l} href={new URL(pathFor(l, path), site).href} />)}
  </head>
  <body>
    <a class="skip-link" href="#main">{d.nav.skipToContent}</a>
    <Header lang={lang} current={current} switchHref={switchHref} otherLang={other} />
    <main id="main"><slot /></main>
    <Footer lang={lang} switchHref={switchHref} otherLang={other} />
  </body>
</html>
```

`src/pages/[lang]/index.astro` (vorläufig):

```astro
---
import BaseLayout from '../../layouts/BaseLayout.astro';
import { t } from '../../i18n';
import { isLang, langPaths } from '../../lib/urls';

export function getStaticPaths() {
  return langPaths();
}

const { lang } = Astro.params;
if (!isLang(lang)) throw new Error(`Unknown language ${lang}`);
const d = t(lang);
---
<BaseLayout lang={lang} path="">
  <section class="wrap page-head">
    <h1 class="page-title">{d.home.titleMain}{' '}<i>{d.home.titleAccent}</i></h1>
  </section>
</BaseLayout>
```

- [ ] **Step 10: Prüfen, bauen und E2E-Tests laufen lassen**

Run: `npm run check && npm test && npm run build && npm run test:e2e`
Expected: `astro check` 0 errors, 0 warnings; Vitest PASS; Build "Complete!" mit `dist/index.html`, `dist/en/index.html`, `dist/de/index.html`; Playwright: 6 passed, 2 skipped (je Projekt ein übersprungener Test).

- [ ] **Step 11: Sichtprüfung im Browser**

`preview_start` mit Name `tv-preview` (aus `.claude/launch.json`), dann `/en/` bei 1920 px und 390 px ansehen: Logo kursiv, EN / DE rechts, auf dem Handy ☰ statt Links.

- [ ] **Step 12: Commit**

```bash
git add -A
git commit -m "feat: Astro-Grundgerüst mit Sprachen, Layout und Menü

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 2: Inhaltsmodell, Prüfungen und alle Texte

**Files:**
- Create: `src/content.config.ts`, `src/lib/ids.ts`, `src/lib/content-checks.ts`, `src/lib/content.ts`, `src/lib/maps-link.ts`, `scripts/resolve-maps-link.ts`
- Create: `src/content/places/{en,de}/*.md` (5 je Sprache), `src/content/tips/{en,de}/bangkok-*.md` (11 je Sprache), `src/content/tips/{en,de}/thailand-*.md` (14 je Sprache), `src/content/restaurants/{en,de}/bangkok-*.md` (8 je Sprache), `src/content/skips/{en,de}/sky-bar-lebua.md`
- Test: `tests/unit/ids.test.ts`, `tests/unit/content-checks.test.ts`, `tests/unit/maps-link.test.ts`, `tests/unit/content-files.test.ts`

**Interfaces:**
- Consumes: `LANGS`, `CATEGORIES`, `REGIONS`, `CUISINES`, `Lang` (Task 1), `isLang` (Task 1).
- Produces:
  - `splitId(id: string): { lang: Lang; slug: string }`
  - `CollectionName = 'places' | 'tips' | 'restaurants' | 'skips' | 'pages'`, `INVARIANT_FIELDS`, `CheckItem`, `invariantOf(collection, data, photoKey): string`, `findContentProblems(items: CheckItem[]): string[]`
  - `Localized<C> = { slug: string; entry: CollectionEntry<C> }` und `getPlaces(lang)`, `getPlace(lang, slug)`, `getTips(lang, place)`, `getTip(lang, slug)`, `getThailandTips(lang, featuredOnly?)`, `getRestaurants(lang, place)`, `getSkips(lang)`, `getPlaceOverview(lang): Promise<{ place: Localized<'places'>; tipCount: number; featured: Localized<'tips'>[] }[]>`, `ensureContentValid()`
  - `parseMapsUrl(url: string): { lat: number; lng: number; name?: string } | null`
  - Inhalts-Slugs (Dateinamen ohne `.md`), die spätere Tasks und Tests verwenden: siehe Steps 9 bis 12.

- [ ] **Step 1: `yaml` für den Dateitest installieren**

```bash
npm i -D yaml@^2
```

- [ ] **Step 2: Failing Unit-Tests für IDs, Prüflogik und Maps-Links schreiben**

`tests/unit/ids.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { splitId } from '../../src/lib/ids';

describe('splitId', () => {
  it('splits a content id into language and slug', () => {
    expect(splitId('en/bangkok-wat-paknam')).toEqual({ lang: 'en', slug: 'bangkok-wat-paknam' });
    expect(splitId('de/bangkok')).toEqual({ lang: 'de', slug: 'bangkok' });
  });

  it('rejects ids without a known language folder', () => {
    expect(() => splitId('bangkok')).toThrow(/must look like/);
    expect(() => splitId('fr/bangkok')).toThrow(/must look like/);
  });
});
```

`tests/unit/content-checks.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { findContentProblems, invariantOf, type CheckItem } from '../../src/lib/content-checks';

const item = (overrides: Partial<CheckItem>): CheckItem => ({
  collection: 'tips', lang: 'en', slug: 'bangkok-tichuca', invariant: '{}', ...overrides,
});

describe('findContentProblems', () => {
  it('accepts a complete language pair with valid references', () => {
    expect(findContentProblems([
      item({ collection: 'places', slug: 'bangkok' }),
      item({ collection: 'places', slug: 'bangkok', lang: 'de' }),
      item({ placeRef: 'bangkok' }),
      item({ lang: 'de', placeRef: 'bangkok' }),
    ])).toEqual([]);
  });

  it('reports a missing German version', () => {
    expect(findContentProblems([item({ placeRef: 'thailand' })])).toEqual(['tips/bangkok-tichuca: missing de version']);
  });

  it('reports fields that differ between languages', () => {
    const problems = findContentProblems([item({ invariant: '{"order":1}' }), item({ lang: 'de', invariant: '{"order":2}' })]);
    expect(problems).toHaveLength(1);
    expect(problems[0]).toMatch(/must be identical in all languages/);
  });

  it('reports unknown places and tips but accepts "thailand"', () => {
    const problems = findContentProblems([
      item({ placeRef: 'atlantis' }), item({ lang: 'de', placeRef: 'atlantis' }),
      item({ collection: 'skips', slug: 'x', tipRef: 'nope' }), item({ collection: 'skips', slug: 'x', lang: 'de', tipRef: 'nope' }),
      item({ slug: 'thailand-singha', placeRef: 'thailand' }), item({ slug: 'thailand-singha', lang: 'de', placeRef: 'thailand' }),
    ]);
    expect(problems).toEqual([
      'tips/bangkok-tichuca (en): unknown place "atlantis"',
      'tips/bangkok-tichuca (de): unknown place "atlantis"',
      'skips/x (en): unknown tip "nope"',
      'skips/x (de): unknown tip "nope"',
    ]);
  });

  it('does not ask for a second language when an entry declares onlyLang', () => {
    expect(findContentProblems([item({ collection: 'pages', slug: 'impressum', lang: 'de', onlyLang: 'de' })])).toEqual([]);
  });
});

describe('invariantOf', () => {
  it('keeps only language-independent fields and reduces photos to their file', () => {
    const value = invariantOf('tips', {
      title: 'Tichuca', order: 3, category: 'rooftops',
      photos: [{ src: 'a.jpg', alt: 'A' }],
    }, (photo) => (photo as { src: string }).src);
    expect(JSON.parse(value)).toEqual({
      place: null, number: null, order: 3, category: 'rooftops', coords: null, maps: null, featured: null, tile: null, photos: ['a.jpg'],
    });
  });
});
```

`tests/unit/maps-link.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { parseMapsUrl } from '../../src/lib/maps-link';

const WAT_PAKNAM = 'https://www.google.com/maps/place/Wat+Paknam+Phasi+Charoen/@13.7217762,100.467783,17z/data=!3m1!4b1!4m6!3m5!1s0x30e29845c0d705bf:0x10c8ec5ed763670b!8m2!3d13.7217762!4d100.4703579!16zL20vMDhuMXk4?entry=tts';

describe('parseMapsUrl', () => {
  it('prefers the pin position over the map centre', () => {
    expect(parseMapsUrl(WAT_PAKNAM)).toEqual({ lat: 13.7217762, lng: 100.4703579, name: 'Wat Paknam Phasi Charoen' });
  });

  it('falls back to the map centre', () => {
    expect(parseMapsUrl('https://www.google.com/maps/@13.75,100.5,15z')).toEqual({ lat: 13.75, lng: 100.5 });
  });

  it('returns null without coordinates', () => {
    expect(parseMapsUrl('https://maps.app.goo.gl/abc')).toBeNull();
  });
});
```

- [ ] **Step 3: Tests laufen lassen, sie müssen scheitern**

Run: `npx vitest run tests/unit/ids.test.ts tests/unit/content-checks.test.ts tests/unit/maps-link.test.ts`
Expected: FAIL, Module nicht gefunden.

- [ ] **Step 4: IDs, Prüflogik und Maps-Parser schreiben**

`src/lib/ids.ts`:

```ts
import type { Lang } from '../i18n/types';
import { isLang } from './urls';

export function splitId(id: string): { lang: Lang; slug: string } {
  const [lang, ...rest] = id.split('/');
  const slug = rest.join('/');
  if (!isLang(lang) || slug === '') throw new Error(`Content id "${id}" must look like "<en|de>/<slug>"`);
  return { lang, slug };
}
```

`src/lib/content-checks.ts`:

```ts
import { LANGS } from '../i18n/types';

export type CollectionName = 'places' | 'tips' | 'restaurants' | 'skips' | 'pages';

export const INVARIANT_FIELDS: Record<CollectionName, readonly string[]> = {
  places: ['region', 'order', 'coords', 'mapLabelSide', 'cover'],
  tips: ['place', 'number', 'order', 'category', 'coords', 'maps', 'featured', 'tile', 'photos'],
  restaurants: ['place', 'cuisine', 'order', 'coords', 'mapsUrl', 'photos'],
  skips: ['order', 'insteadTip'],
  pages: ['onlyLang'],
};

export interface CheckItem {
  collection: CollectionName;
  lang: string;
  slug: string;
  invariant: string;
  placeRef?: string;
  tipRef?: string;
  onlyLang?: string;
}

export function invariantOf(
  collection: CollectionName,
  data: Record<string, unknown>,
  photoKey: (photo: unknown) => unknown,
): string {
  const picked: Record<string, unknown> = {};
  for (const field of INVARIANT_FIELDS[collection]) {
    const value = data[field];
    if (field === 'photos' && Array.isArray(value)) picked[field] = value.map((photo) => photoKey(photo));
    else if (field === 'cover' && value) picked[field] = photoKey(value);
    else picked[field] = value ?? null;
  }
  return JSON.stringify(picked);
}

export function findContentProblems(items: CheckItem[]): string[] {
  const problems: string[] = [];
  const keyOf = (item: CheckItem) => `${item.collection}/${item.slug}`;
  const groups = new Map<string, CheckItem[]>();
  for (const item of items) groups.set(keyOf(item), [...(groups.get(keyOf(item)) ?? []), item]);

  for (const [key, group] of groups) {
    const onlyLang = group.find((entry) => entry.onlyLang)?.onlyLang;
    const expected = onlyLang ? [onlyLang] : [...LANGS];
    for (const lang of expected) {
      if (!group.some((entry) => entry.lang === lang)) problems.push(`${key}: missing ${lang} version`);
    }
    if (new Set(group.map((entry) => entry.invariant)).size > 1) {
      problems.push(`${key}: fields that must be identical in all languages differ (${INVARIANT_FIELDS[group[0].collection].join(', ')})`);
    }
  }

  const places = new Set(items.filter((item) => item.collection === 'places').map((item) => item.slug));
  const tips = new Set(items.filter((item) => item.collection === 'tips').map((item) => item.slug));
  for (const item of items) {
    if (item.placeRef !== undefined && item.placeRef !== 'thailand' && !places.has(item.placeRef)) {
      problems.push(`${keyOf(item)} (${item.lang}): unknown place "${item.placeRef}"`);
    }
    if (item.tipRef !== undefined && !tips.has(item.tipRef)) {
      problems.push(`${keyOf(item)} (${item.lang}): unknown tip "${item.tipRef}"`);
    }
  }
  return problems;
}
```

`src/lib/maps-link.ts`:

```ts
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
```

`scripts/resolve-maps-link.ts` (Werkzeug für neue Links der Autorin, läuft mit Node-Type-Stripping):

```ts
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
```

- [ ] **Step 5: Unit-Tests laufen lassen, sie müssen bestehen**

Run: `npx vitest run tests/unit/ids.test.ts tests/unit/content-checks.test.ts tests/unit/maps-link.test.ts`
Expected: PASS (11 Tests).

- [ ] **Step 6: Collections und Lade-Funktionen schreiben**

`src/content.config.ts`:

```ts
import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';
import { CATEGORIES, CUISINES, REGIONS } from './i18n/types';

const coords = z.tuple([z.number().min(-90).max(90), z.number().min(-180).max(180)]);
const fact = z.object({ label: z.string(), value: z.string() });
const credit = z.object({ author: z.string(), license: z.string(), licenseUrl: z.url().optional(), source: z.url() });

const places = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/places' }),
  schema: ({ image }) =>
    z.object({
      name: z.string(),
      summary: z.string(),
      region: z.enum(REGIONS),
      order: z.number().int(),
      coords,
      heroLabel: z.string().optional(),
      mapLabelSide: z.enum(['left', 'right']).default('right'),
      cover: z.object({ src: image(), alt: z.string(), position: z.string().optional() }).optional(),
    }),
});

const tips = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/tips' }),
  schema: ({ image }) =>
    z.object({
      place: z.string(),
      number: z.string().optional(),
      order: z.number().int(),
      title: z.string(),
      category: z.enum(CATEGORIES),
      facts: z.array(fact).default([]),
      more: z.object({ title: z.string(), text: z.string() }).optional(),
      skip: z.string().optional(),
      maps: z.array(z.object({ label: z.string().optional(), url: z.url() })).default([]),
      coords: coords.optional(),
      pinNote: z.string().optional(),
      link: z.object({ label: z.string(), href: z.string() }).optional(),
      featured: z.boolean().default(false),
      tile: z
        .object({
          tone: z.enum(['card', 'red', 'sand', 'ink']).default('card'),
          size: z.enum(['normal', 'tall', 'wide']).default('normal'),
        })
        .optional(),
      photos: z
        .array(z.object({ src: image(), alt: z.string(), position: z.string().optional(), credit: credit.optional() }))
        .default([]),
    }),
});

const restaurants = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/restaurants' }),
  schema: ({ image }) =>
    z.object({
      place: z.string(),
      name: z.string(),
      cuisine: z.enum(CUISINES),
      order: z.number().int(),
      price: z.string(),
      mapsUrl: z.url(),
      coords: coords.optional(),
      photos: z
        .array(z.object({ src: image(), alt: z.string(), position: z.string().optional(), credit: credit.optional() }))
        .default([]),
    }),
});

const skips = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/skips' }),
  schema: z.object({ title: z.string(), order: z.number().int(), insteadTip: z.string().optional() }),
});

export const collections = { places, tips, restaurants, skips };
```

`src/lib/content.ts`:

```ts
import { getCollection, type CollectionEntry } from 'astro:content';
import type { Lang } from '../i18n/types';
import { findContentProblems, invariantOf, type CheckItem } from './content-checks';
import { splitId } from './ids';

type Name = 'places' | 'tips' | 'restaurants' | 'skips';

export interface Localized<C extends Name> {
  slug: string;
  entry: CollectionEntry<C>;
}

const NAMES: Name[] = ['places', 'tips', 'restaurants', 'skips'];
const photoKey = (photo: unknown) => (photo as { src: { src: string } }).src.src;

let validation: Promise<void> | undefined;

export function ensureContentValid(): Promise<void> {
  validation ??= (async () => {
    const items: CheckItem[] = [];
    for (const name of NAMES) {
      for (const entry of await getCollection(name)) {
        const { lang, slug } = splitId(entry.id);
        const data = entry.data as Record<string, unknown>;
        items.push({
          collection: name,
          lang,
          slug,
          invariant: invariantOf(name, data, photoKey),
          placeRef: typeof data.place === 'string' ? data.place : undefined,
          tipRef: typeof data.insteadTip === 'string' ? data.insteadTip : undefined,
        });
      }
    }
    const problems = findContentProblems(items);
    if (problems.length > 0) throw new Error(`Content problems:\n- ${problems.join('\n- ')}`);
  })();
  return validation;
}

async function localized<C extends Name>(name: C, lang: Lang): Promise<Localized<C>[]> {
  await ensureContentValid();
  const entries = (await getCollection(name)) as CollectionEntry<C>[];
  return entries
    .filter((entry) => splitId(entry.id).lang === lang)
    .map((entry) => ({ slug: splitId(entry.id).slug, entry }));
}

const orderOf = (entry: { data: unknown }) => (entry.data as { order?: number }).order ?? 0;

function byOrder<C extends Name>(a: Localized<C>, b: Localized<C>): number {
  return orderOf(a.entry) - orderOf(b.entry);
}

export async function getPlaces(lang: Lang): Promise<Localized<'places'>[]> {
  return (await localized('places', lang)).sort(byOrder);
}

export async function getPlace(lang: Lang, slug: string): Promise<Localized<'places'> | undefined> {
  return (await getPlaces(lang)).find((place) => place.slug === slug);
}

export async function getTips(lang: Lang, place: string): Promise<Localized<'tips'>[]> {
  return (await localized('tips', lang)).filter((tip) => tip.entry.data.place === place).sort(byOrder);
}

export async function getTip(lang: Lang, slug: string): Promise<Localized<'tips'> | undefined> {
  return (await localized('tips', lang)).find((tip) => tip.slug === slug);
}

export async function getThailandTips(lang: Lang, featuredOnly = false): Promise<Localized<'tips'>[]> {
  const tips = await getTips(lang, 'thailand');
  return featuredOnly ? tips.filter((tip) => tip.entry.data.featured) : tips;
}

export async function getRestaurants(lang: Lang, place: string): Promise<Localized<'restaurants'>[]> {
  return (await localized('restaurants', lang)).filter((r) => r.entry.data.place === place).sort(byOrder);
}

export async function getSkips(lang: Lang): Promise<Localized<'skips'>[]> {
  return (await localized('skips', lang)).sort(byOrder);
}

export async function getPlaceOverview(
  lang: Lang,
): Promise<{ place: Localized<'places'>; tipCount: number; featured: Localized<'tips'>[] }[]> {
  const places = await getPlaces(lang);
  return Promise.all(
    places.map(async (place) => {
      const tips = await getTips(lang, place.slug);
      return { place, tipCount: tips.length, featured: tips.filter((tip) => tip.entry.data.featured).slice(0, 4) };
    }),
  );
}
```

- [ ] **Step 7: Failing Test für die echten Inhaltsdateien schreiben**

`tests/unit/content-files.test.ts`:

```ts
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { parse } from 'yaml';
import { describe, expect, it } from 'vitest';
import { findContentProblems, invariantOf, type CheckItem, type CollectionName } from '../../src/lib/content-checks';

const ROOT = resolve(import.meta.dirname, '../../src/content');

interface ContentFile { file: string; collection: CollectionName; lang: string; data: Record<string, unknown>; body: string; text: string }

function readAll(): ContentFile[] {
  const files: ContentFile[] = [];
  for (const collection of readdirSync(ROOT) as CollectionName[]) {
    for (const lang of readdirSync(join(ROOT, collection))) {
      for (const name of readdirSync(join(ROOT, collection, lang)).filter((f) => f.endsWith('.md'))) {
        const file = join(ROOT, collection, lang, name);
        const text = readFileSync(file, 'utf8');
        const match = /^---\n([\s\S]*?)\n---\n?([\s\S]*)$/.exec(text);
        if (!match) throw new Error(`${file}: missing frontmatter`);
        files.push({ file, collection, lang, data: parse(match[1]) as Record<string, unknown>, body: match[2].trim(), text });
      }
    }
  }
  return files;
}

const files = readAll();
const items: CheckItem[] = files.map(({ file, collection, lang, data }) => ({
  collection,
  lang,
  slug: file.split('/').at(-1)!.replace(/\.md$/, ''),
  invariant: invariantOf(collection, data, (photo) => (photo as { src: string }).src),
  placeRef: typeof data.place === 'string' ? data.place : undefined,
  tipRef: typeof data.insteadTip === 'string' ? data.insteadTip : undefined,
  onlyLang: typeof data.onlyLang === 'string' ? data.onlyLang : undefined,
}));

describe('content files', () => {
  it('pair up across languages and reference existing places and tips', () => {
    expect(findContentProblems(items)).toEqual([]);
  });

  it('only reference photos that exist', () => {
    const missing: string[] = [];
    for (const { file, data } of files) {
      const photos = [...((data.photos as { src: string }[] | undefined) ?? []), ...(data.cover ? [data.cover as { src: string }] : [])];
      for (const photo of photos) if (!existsSync(resolve(dirname(file), photo.src))) missing.push(`${file}: ${photo.src}`);
    }
    expect(missing).toEqual([]);
  });

  it('have text in every tip, restaurant and skip', () => {
    const empty = files.filter((f) => ['tips', 'restaurants', 'skips'].includes(f.collection) && f.body === '').map((f) => f.file);
    expect(empty).toEqual([]);
  });

  it('contain no em dashes', () => {
    expect(files.filter((f) => f.text.includes('\u2014')).map((f) => f.file)).toEqual([]);
  });

  it('contain the eleven Bangkok tips and fourteen tips for all of Thailand', () => {
    const tipsIn = (place: string) => items.filter((i) => i.collection === 'tips' && i.lang === 'en' && i.placeRef === place);
    expect(tipsIn('bangkok')).toHaveLength(11);
    expect(tipsIn('thailand')).toHaveLength(14);
  });
});
```

Run: `npx vitest run tests/unit/content-files.test.ts`
Expected: FAIL, `ENOENT ... src/content`.

- [ ] **Step 8: Orte anlegen (5 je Sprache)**

Koordinaten sind `[Breite, Länge]`. Der Text unter dem Frontmatter ist das Intro für die Ortsseite (nur bei Orten mit Tipps sichtbar).

`src/content/places/en/bangkok.md`:

```md
---
name: Bangkok
summary: The hustle and bustle of the heart of Thailand is absolutely fascinating. Amazing rooftop bars, extremely good restaurants, beautiful temples, the best massages and spas and bustling markets.
region: capital
order: 1
coords: [13.7563, 100.5018]
heroLabel: where we lived
---
This is the place we spent most of our time since we moved here. So there's lots of recommendations, from temples, markets and rooftops to nightlife, plus things we wouldn't recommend.
```

`src/content/places/de/bangkok.md`:

```md
---
name: Bangkok
summary: Das Gewusel im Herzen Thailands ist absolut faszinierend. Tolle Rooftop-Bars, extrem gute Restaurants, wunderschöne Tempel, die besten Massagen und Spas und quirlige Märkte.
region: capital
order: 1
coords: [13.7563, 100.5018]
heroLabel: wo wir gewohnt haben
---
Hier haben wir die meiste Zeit verbracht, seit wir hergezogen sind. Deshalb gibt es jede Menge Empfehlungen, von Tempeln, Märkten und Rooftops bis zum Nachtleben, plus Dinge, die wir nicht empfehlen würden.
```

`src/content/places/en/koh-phangan.md`:

```md
---
name: Koh Phangan
summary: Everyone is coming to Thailand for the beaches, and this is one of my favorite islands.
region: islands
order: 2
coords: [9.7319, 100.0136]
---
```

`src/content/places/de/koh-phangan.md`:

```md
---
name: Koh Phangan
summary: Alle kommen wegen der Strände nach Thailand, und das hier ist eine meiner Lieblingsinseln.
region: islands
order: 2
coords: [9.7319, 100.0136]
---
```

`src/content/places/en/chiang-mai.md`:

```md
---
name: Chiang Mai
summary: If you have more than 10 days I would highly recommend to explore the north of Thailand as well as the islands.
region: north
order: 3
coords: [18.7883, 98.9853]
---
```

`src/content/places/de/chiang-mai.md`:

```md
---
name: Chiang Mai
summary: Wenn du mehr als 10 Tage hast, würde ich dir sehr empfehlen, neben den Inseln auch den Norden Thailands zu erkunden.
region: north
order: 3
coords: [18.7883, 98.9853]
---
```

`src/content/places/en/chiang-rai.md`:

```md
---
name: Chiang Rai
summary: Don't miss the beautiful north of Thailand.
region: north
order: 4
coords: [19.9105, 99.8406]
---
```

`src/content/places/de/chiang-rai.md`:

```md
---
name: Chiang Rai
summary: Lass dir den wunderschönen Norden Thailands nicht entgehen.
region: north
order: 4
coords: [19.9105, 99.8406]
---
```

`src/content/places/en/kanchanaburi.md`:

```md
---
name: Kanchanaburi
summary: There's so much beauty close to the capital that you do not need to take a flight to.
region: weekend-trips
order: 5
coords: [14.0228, 99.5328]
mapLabelSide: left
---
```

`src/content/places/de/kanchanaburi.md`:

```md
---
name: Kanchanaburi
summary: So viel Schönes liegt ganz nah an der Hauptstadt, dafür musst du nicht mal fliegen.
region: weekend-trips
order: 5
coords: [14.0228, 99.5328]
mapLabelSide: left
---
```

- [ ] **Step 9: Die 11 Bangkok-Tipps auf Englisch anlegen**

Die Koordinaten stammen aus den Google-Maps-Links der Autorin (Pin-Position). Fotos kommen in Task 3 dazu.

`src/content/tips/en/bangkok-wat-paknam.md`:

```md
---
place: bangkok
number: "01"
order: 1
title: Wat Paknam Phasi Charoen
category: temples
coords: [13.7217762, 100.4703579]
maps:
  - url: https://maps.app.goo.gl/GZJXQkbFn25JmQFZA
facts:
  - label: Open
    value: Daily 6am to 8pm
  - label: Entry
    value: Free
  - label: Wear
    value: Shoulders and knees covered, shoes off at the sign
more:
  title: Another nice temple
  text: Wat Arun, where you can get dressed in a traditional Thai outfit and get your photos taken.
featured: true
---
You honestly can't leave Thailand without visiting at least one temple, so here's my favorite. You have probably heard of the Grand Palace and the reclining Buddha, but Wat Paknam is less touristy, absolutely stunning, and no TukTuk driver will tell you it's closed. Take in the largest Buddha statue of Bangkok, then step inside the white stupa and climb its five levels to the emerald statues on the top floor. You will most likely see monks too. Taking photos is totally fine, just be mindful of locals praying.
```

`src/content/tips/en/bangkok-jodd-fairs.md`:

```md
---
place: bangkok
number: "02"
order: 2
title: Jodd Fairs
category: markets
coords: [13.7565029, 100.5669228]
maps:
  - url: https://maps.app.goo.gl/6KRBv1sVKHVZL9fQ6
facts:
  - label: Open
    value: Daily 5pm to 12am
  - label: Try
    value: Mango sticky rice, Pad Krapao Moo with a kai dao (fried egg)
more:
  title: More markets
  text: "Chatuchak, the huge weekend market (Sat and Sun 6am to 6pm): if you can't find it here, you won't find it anywhere. The Train Night Market DanNeramit (Thu to Sun 5pm to 12am) with its Disney-like castle. Both are a little outside the city, Jodd Fairs is easy to get to and open every day."
featured: true
---
Markets are one of my favorite things about Thailand, and you'll find them everywhere, all the time. Jodd Fairs is my favorite one: not too big, not too small, with a nice variety of food, snacks, drinks, clothing, accessories and jewelry. It's a 'farang' (foreigner) friendly market, so everything is pretty safe to eat. There's usually live music, so grab a Singha and watch as people go by.
```

`src/content/tips/en/bangkok-tichuca.md`:

```md
---
place: bangkok
number: "03"
order: 3
title: Tichuca
category: rooftops
coords: [13.7222399, 100.5807134]
maps:
  - url: https://maps.app.goo.gl/9ZdcDJE2qdYppD4e8
facts:
  - label: Open
    value: Sun to Thu 5pm to 12am, Fri and Sat until 1:30am
  - label: After
    value: Club 'Chupa' in the same building
more:
  title: More rooftops
  text: Octave, right across, with a live DJ at night that turns into an outdoor club. Vertigo at Banyan Tree, high-end with views from the 61st floor. Pastel for fun party vibes, shows and free shots all night, dancing until 1am.
skip: "Sky Bar at Lebua, the one from Hangover: the view is not that amazing, it's pretty dead, the vibe isn't great and the drinks are outrageously expensive."
featured: true
---
Forget the rooftop from the movie Hangover and visit this gem instead. Tichuca has really great vibes, good music and is right in the centre of Sukhumvit. The view is incredible: go for sunset and watch the sun go down. The cocktails are a little pricey for Thailand, but the view and the vibe are totally worth it.
```

`src/content/tips/en/bangkok-tuktuk.md`:

```md
---
place: bangkok
number: "04"
order: 4
title: Hop on a TukTuk
category: getting-around
pinNote: no fixed spot
---
Ok, this one is kind of obvious, but it's too fun to miss. Take one after sunset, when you're done on the rooftop and want to continue to dinner or a party on Khao San Road. You can bargain with the drivers and will probably still overpay, but it's super cheap and well worth the experience. Enjoy driving through skyscrapers at crazy speed with blasting loud speakers.
```

`src/content/tips/en/bangkok-chinatown.md`:

```md
---
place: bangkok
number: "05"
order: 5
title: Chinatown after sunset
category: food
coords: [13.7373794, 100.5129349]
maps:
  - url: https://maps.app.goo.gl/xdGGVFQVK199HpGPA
facts:
  - label: Open
    value: All the time, best after sunset
---
Chinatown in Bangkok is definitely a must, it's one of the largest Chinatowns in the world. The bustling vibes with tons of really great street food are incomparable. When you search for it, put in Yaowarat Road.
```

`src/content/tips/en/bangkok-iconsiam.md`:

```md
---
place: bangkok
number: "06"
order: 6
title: IconSiam
category: shopping
coords: [13.7264814, 100.509947]
maps:
  - url: https://maps.app.goo.gl/vgfnzVdoZWmDuprh8
facts:
  - label: Open
    value: Daily 10am to 10pm
  - label: Tip
    value: Brands cost more here than in Europe, fill your suitcase with dried mango instead
more:
  title: Other malls
  text: "Platinum Mall for bargains: there are usually no prices displayed, so bargain your heart out. MBK if you're looking for fakes. Central World, similar to IconSiam. Emquartier and Emsphere with the TRIBE rooftop beach club. Siam Paragon, and right after it Siam Square with little boutiques and street performers around sunset."
---
The shopping in Bangkok is out of this world, and IconSiam is probably my favorite mall. I love taking the boat over, for example from Oriental Pier or Sathon Pier, it makes the visit even more special. Inside there's a waterfall, a local market with a small floating market, a Starbucks with great river views and a fountain show every night at 7, 8 and 9pm.
```

`src/content/tips/en/bangkok-massage.md`:

```md
---
place: bangkok
number: "07"
order: 7
title: Get a massage
category: wellness
pinNote: several locations
maps:
  - label: Infinity Spa
    url: https://maps.app.goo.gl/oThpasWfN7EK6iWM7
  - label: Divana
    url: https://maps.app.goo.gl/KKX4PW8f7bHvxV4h6
facts:
  - label: Infinity
    value: Daily 9:30am to 9:30pm
  - label: Divana
    value: Daily 10am to 11pm
more:
  title: My tips
  text: I personally don't enjoy Thai massage, it feels more like stretching for lazy people, so I usually go for a full body oil massage or a foot massage. And check the Google Maps reviews before you go, they'll tell you if the massages are good.
---
Who goes to Thailand and does not get a massage? My two absolute favorites are Infinity Spa and Divana, both with several locations in Bangkok. They're on the higher price end, but still a lot cheaper than back home: a 60 min aroma massage at Infinity is 1,300 Baht (about 40 dollars), with refreshments before and mango sticky rice after. Divana feels more 'Thai' with dark wood, Infinity more 'Western' in white and light green. Regular salons charge 10 to 20 dollars for an hour.
```

`src/content/tips/en/bangkok-street-food.md`:

```md
---
place: bangkok
number: "08"
order: 8
title: Try local (street) food
category: food
pinNote: all over the city
link:
  label: My favorite restaurants in Bangkok →
  href: destinations/bangkok/food/
more:
  title: Dessert and drinks
  text: "You HAVE to try mango sticky rice. Look out for the coconut ice cream carts (they ring a bell), and get a fruit shake: I usually go for pineapple, coconut and banana. Say 'mai ao namdtan' if you want it without sugar."
---
When I first came here I was so worried about food poisoning that I basically had fried rice all day. If you only have a few days or weeks, don't make that mistake. Try Gai Pad Med Mamuang (chicken with cashew nuts, Mike's favourite and not spicy), Pad Krapao Moo (very spicy, so order medium), fried seabass in a salt crust, tiger prawns in tamarind sauce, Chinese kale with crispy pork and Pad See Ew (not spicy). If you are vegan or vegetarian, most dishes come with tofu.
```

`src/content/tips/en/bangkok-khao-san.md`:

```md
---
place: bangkok
number: "09"
order: 9
title: Party at Khao San Road
category: nightlife
coords: [13.7589206, 100.4972578]
maps:
  - url: https://maps.app.goo.gl/dyH9JpmLJdxsPCYi8
facts:
  - label: Bars
    value: The ONE at Khao San (open, three stories), then 'the Club' for dancing
  - label: Chill
    value: The Macaroni Club in a parallel street, with seats at a pond
---
I'm sure you have all heard of Khao San Road, the party street for backpackers, and if you're a little party animal it's definitely an experience. Walking up and down the road you'll hear blasting music from every bar and find everything from roasted scorpions and tarantulas (they really just taste like crisps) to the famous buckets full of cocktails. Buckets are fun, but the alcohol is pretty terrible and they're strong as hell, so I'd switch to beer after the first one.
```

`src/content/tips/en/bangkok-soi-cowboy.md`:

```md
---
place: bangkok
number: "10"
order: 10
title: Soi Cowboy
category: nightlife
coords: [13.7370674, 100.5618986]
maps:
  - url: https://maps.app.goo.gl/hrCicd73meCTkf4g8
---
Sukhumvit Road between Nana and Phrom Phong after sunset is a whole different vibe than during the day. I find people watching and strolling through the red light district, especially Soi Cowboy (also known from Hangover), extremely interesting. If you can't get enough, head over to Nana Plaza. That said, I wouldn't spend too much time there, it can get a little depressing after all.
```

`src/content/tips/en/bangkok-bang-kachao.md`:

```md
---
place: bangkok
number: "10+1"
order: 11
title: Recharge on Bang Kachao
category: nature
coords: [13.7073638, 100.5635626]
maps:
  - url: https://maps.app.goo.gl/jLVpMB1U6CkeEzeZ8
facts:
  - label: Getting there
    value: Taxi to Wat Khlong Toei Nok Pier, then the boat across (tourist boat 40 Baht, ask for the small local one for 20 Baht)
  - label: Bikes
    value: Rent one for the day right on the other side
  - label: Eat
    value: Hidden Woods by the river, Coconut Lane on a coconut farm
more:
  title: A park first?
  text: Sri Nakhon Khuean Khan Park and Botanical Garden.
featured: true
---
If you have been to Bangkok many times or have more than just a few days, take a trip to Bang Kachao. It's a green island right in the heart of Bangkok: rent a bike, ride through the lanes, stroll by the water, have lunch and very good coffee. It's one of my favorite places to get away from the hustle and bustle and have a bit of an island vibe. The boats run until the evening, so don't worry about getting back.
```

- [ ] **Step 10: Die 11 Bangkok-Tipps auf Deutsch anlegen**

Alle Felder außer `title`, `facts`, `more`, `skip`, `pinNote`, `link.label` und dem Text sind identisch mit der englischen Datei (der Test aus Step 7 prüft das).

`src/content/tips/de/bangkok-wat-paknam.md`:

```md
---
place: bangkok
number: "01"
order: 1
title: Wat Paknam Phasi Charoen
category: temples
coords: [13.7217762, 100.4703579]
maps:
  - url: https://maps.app.goo.gl/GZJXQkbFn25JmQFZA
facts:
  - label: Geöffnet
    value: Täglich 6 bis 20 Uhr
  - label: Eintritt
    value: Frei
  - label: Kleidung
    value: Schultern und Knie bedeckt, Schuhe beim Schild ausziehen
more:
  title: Noch ein schöner Tempel
  text: Wat Arun, wo du dich in traditioneller Thai-Kleidung fotografieren lassen kannst.
featured: true
---
Ohne mindestens einen Tempel solltest du Thailand wirklich nicht verlassen, also hier ist mein Liebling. Vom Grand Palace und dem liegenden Buddha hast du bestimmt schon gehört, aber Wat Paknam ist weniger touristisch, absolut atemberaubend, und kein TukTuk-Fahrer erzählt dir, dass er geschlossen hat. Bestaune die größte Buddha-Statue Bangkoks, geh dann in die weiße Stupa und steig ihre fünf Etagen hinauf bis zu den smaragdgrünen Statuen ganz oben. Wahrscheinlich siehst du dort auch Mönche. Fotografieren ist völlig in Ordnung, nimm nur Rücksicht auf Einheimische, die beten.
```

`src/content/tips/de/bangkok-jodd-fairs.md`:

```md
---
place: bangkok
number: "02"
order: 2
title: Jodd Fairs
category: markets
coords: [13.7565029, 100.5669228]
maps:
  - url: https://maps.app.goo.gl/6KRBv1sVKHVZL9fQ6
facts:
  - label: Geöffnet
    value: Täglich 17 bis 24 Uhr
  - label: Probieren
    value: Mango Sticky Rice, Pad Krapao Moo mit Kai Dao (Spiegelei)
more:
  title: Noch mehr Märkte
  text: "Chatuchak, der riesige Wochenendmarkt (Sa und So 6 bis 18 Uhr): Was du dort nicht findest, findest du nirgends. Der Train Night Market DanNeramit (Do bis So 17 bis 24 Uhr) mit seinem Disney-artigen Schloss. Beide liegen etwas außerhalb, Jodd Fairs ist leicht zu erreichen und jeden Tag geöffnet."
featured: true
---
Märkte gehören zu meinen liebsten Dingen an Thailand, und du findest sie wirklich überall und zu jeder Zeit. Jodd Fairs ist mein Favorit: nicht zu groß, nicht zu klein, mit einer schönen Auswahl an Essen, Snacks, Getränken, Kleidung, Accessoires und Schmuck. Der Markt ist 'farang'-freundlich (farang heißt Ausländer), du kannst also fast alles bedenkenlos essen. Meistens gibt es Livemusik, also schnapp dir ein Singha und schau den Leuten zu.
```

`src/content/tips/de/bangkok-tichuca.md`:

```md
---
place: bangkok
number: "03"
order: 3
title: Tichuca
category: rooftops
coords: [13.7222399, 100.5807134]
maps:
  - url: https://maps.app.goo.gl/9ZdcDJE2qdYppD4e8
facts:
  - label: Geöffnet
    value: So bis Do 17 bis 24 Uhr, Fr und Sa bis 1:30 Uhr
  - label: Danach
    value: Club 'Chupa' im selben Gebäude
more:
  title: Noch mehr Rooftops
  text: Das Octave direkt gegenüber, mit Live-DJ, abends wird daraus ein Open-Air-Club. Vertigo im Banyan Tree, edel und mit Aussicht aus dem 61. Stock. Pastel für Partystimmung, Shows und Gratis-Shots die ganze Nacht, Tanzen bis 1 Uhr.
skip: "Die Sky Bar im Lebua, die aus Hangover: Die Aussicht ist gar nicht so besonders, es ist ziemlich tot, die Stimmung ist mau und die Drinks sind unverschämt teuer."
featured: true
---
Vergiss die Rooftop-Bar aus dem Film Hangover und geh lieber hierhin. Das Tichuca hat eine richtig tolle Atmosphäre, gute Musik und liegt mitten in Sukhumvit. Die Aussicht ist unglaublich: Komm zum Sonnenuntergang und schau zu, wie die Sonne versinkt. Die Cocktails sind für Thailand etwas teurer, aber Aussicht und Stimmung sind es total wert.
```

`src/content/tips/de/bangkok-tuktuk.md`:

```md
---
place: bangkok
number: "04"
order: 4
title: Steig in ein TukTuk
category: getting-around
pinNote: kein fester Ort
---
Okay, das ist ziemlich offensichtlich, aber zu lustig, um es auszulassen. Nimm eins nach Sonnenuntergang, wenn du von der Rooftop-Bar weiter zum Essen oder zur Party auf der Khao San Road willst. Du kannst mit den Fahrern handeln und zahlst wahrscheinlich trotzdem zu viel, aber es ist super günstig und das Erlebnis wert. Genieß die Fahrt zwischen Wolkenkratzern in irrem Tempo mit dröhnenden Lautsprechern.
```

`src/content/tips/de/bangkok-chinatown.md`:

```md
---
place: bangkok
number: "05"
order: 5
title: Chinatown nach Sonnenuntergang
category: food
coords: [13.7373794, 100.5129349]
maps:
  - url: https://maps.app.goo.gl/xdGGVFQVK199HpGPA
facts:
  - label: Geöffnet
    value: Immer, am besten nach Sonnenuntergang
---
Chinatown in Bangkok ist ein absolutes Muss, es ist eines der größten Chinatowns der Welt. Das quirlige Treiben mit jeder Menge richtig gutem Streetfood ist unvergleichlich. Wenn du es suchst, gib Yaowarat Road ein.
```

`src/content/tips/de/bangkok-iconsiam.md`:

```md
---
place: bangkok
number: "06"
order: 6
title: IconSiam
category: shopping
coords: [13.7264814, 100.509947]
maps:
  - url: https://maps.app.goo.gl/vgfnzVdoZWmDuprh8
facts:
  - label: Geöffnet
    value: Täglich 10 bis 22 Uhr
  - label: Tipp
    value: Marken sind hier teurer als in Europa, füll deinen Koffer lieber mit getrockneter Mango
more:
  title: Weitere Malls
  text: "Platinum Mall für Schnäppchen: Preise stehen meist nicht dran, also handeln, was das Zeug hält. MBK, wenn du Fakes suchst. Central World, ähnlich wie IconSiam. Emquartier und Emsphere mit dem TRIBE Rooftop Beach Club. Siam Paragon und gleich danach Siam Square mit kleinen Boutiquen und Straßenkünstlern rund um den Sonnenuntergang."
---
Shoppen in Bangkok ist der Wahnsinn, und IconSiam ist wahrscheinlich meine liebste Mall. Ich fahre am liebsten mit dem Boot hin, zum Beispiel vom Oriental Pier oder Sathon Pier, das macht den Besuch noch besonderer. Drinnen gibt es einen Wasserfall, einen Markt mit kleinem schwimmendem Markt, ein Starbucks mit toller Aussicht auf den Fluss und jeden Abend um 19, 20 und 21 Uhr eine Wasserspiel-Show.
```

`src/content/tips/de/bangkok-massage.md`:

```md
---
place: bangkok
number: "07"
order: 7
title: Gönn dir eine Massage
category: wellness
pinNote: mehrere Standorte
maps:
  - label: Infinity Spa
    url: https://maps.app.goo.gl/oThpasWfN7EK6iWM7
  - label: Divana
    url: https://maps.app.goo.gl/KKX4PW8f7bHvxV4h6
facts:
  - label: Infinity
    value: Täglich 9:30 bis 21:30 Uhr
  - label: Divana
    value: Täglich 10 bis 23 Uhr
more:
  title: Meine Tipps
  text: Thai-Massage mag ich persönlich gar nicht, das fühlt sich eher an wie Stretching für Faule. Ich nehme meistens eine Ganzkörper-Ölmassage oder eine Fußmassage. Und schau vorher in die Google-Maps-Bewertungen, da siehst du, ob die Massagen gut sind.
---
Wer fährt nach Thailand und lässt sich nicht massieren? Meine zwei absoluten Favoriten sind Infinity Spa und Divana, beide mit mehreren Standorten in Bangkok. Sie sind eher im oberen Preisbereich, aber immer noch viel günstiger als zu Hause: 60 Minuten Aroma-Massage im Infinity kosten 1.300 Baht (etwa 40 Dollar), mit Erfrischungen vorher und Mango Sticky Rice danach. Divana wirkt mit dunklem Holz eher 'thailändisch', Infinity in Weiß und Hellgrün eher 'westlich'. Normale Salons nehmen 10 bis 20 Dollar pro Stunde.
```

`src/content/tips/de/bangkok-street-food.md`:

```md
---
place: bangkok
number: "08"
order: 8
title: Probier lokales (Street-)Food
category: food
pinNote: überall in der Stadt
link:
  label: Meine Lieblingsrestaurants in Bangkok →
  href: destinations/bangkok/food/
more:
  title: Dessert und Getränke
  text: "Mango Sticky Rice MUSST du probieren. Halt Ausschau nach den Kokoseis-Wagen (sie klingeln mit einer Glocke) und gönn dir einen Fruchtshake: Ich nehme meistens Ananas, Kokos und Banane. Sag 'mai ao namdtan', wenn du ihn ohne Zucker willst."
---
Als ich hierherkam, hatte ich solche Angst vor einer Lebensmittelvergiftung, dass ich praktisch den ganzen Tag gebratenen Reis gegessen habe. Wenn du nur ein paar Tage oder Wochen hast, mach nicht denselben Fehler. Probier Gai Pad Med Mamuang (Hähnchen mit Cashewnüssen, Mikes Liebling und nicht scharf), Pad Krapao Moo (sehr scharf, also bestell medium), gebratenen Wolfsbarsch in Salzkruste, Tigergarnelen in Tamarindensoße, chinesischen Grünkohl mit knusprigem Schweinefleisch und Pad See Ew (nicht scharf). Wenn du vegan oder vegetarisch isst: Die meisten Gerichte gibt es mit Tofu.
```

`src/content/tips/de/bangkok-khao-san.md`:

```md
---
place: bangkok
number: "09"
order: 9
title: Feiern auf der Khao San Road
category: nightlife
coords: [13.7589206, 100.4972578]
maps:
  - url: https://maps.app.goo.gl/dyH9JpmLJdxsPCYi8
facts:
  - label: Bars
    value: The ONE at Khao San (offen, drei Etagen), danach 'the Club' zum Tanzen
  - label: Entspannter
    value: The Macaroni Club in einer Parallelstraße, mit Plätzen an einem Teich
---
Von der Khao San Road, der Partymeile der Backpacker, hast du bestimmt schon gehört, und wenn du gern feierst, ist sie auf jeden Fall ein Erlebnis. Beim Bummeln die Straße rauf und runter dröhnt aus jeder Bar Musik, und du findest alles von gerösteten Skorpionen und Taranteln (die schmecken wirklich wie Chips) bis zu den berühmten Eimern voller Cocktails. Die Buckets machen Spaß, aber der Alkohol darin ist ziemlich schlecht und sie sind höllisch stark, also würde ich nach dem ersten auf Bier umsteigen.
```

`src/content/tips/de/bangkok-soi-cowboy.md`:

```md
---
place: bangkok
number: "10"
order: 10
title: Soi Cowboy
category: nightlife
coords: [13.7370674, 100.5618986]
maps:
  - url: https://maps.app.goo.gl/hrCicd73meCTkf4g8
---
Die Sukhumvit Road zwischen Nana und Phrom Phong hat nach Sonnenuntergang eine ganz andere Stimmung als tagsüber. Leute beobachten und durch das Rotlichtviertel schlendern, vor allem durch die Soi Cowboy (auch bekannt aus Hangover), finde ich extrem spannend. Wenn du nicht genug bekommst, geh weiter zur Nana Plaza. Zu lange würde ich aber nicht bleiben, es kann einen auch ein bisschen deprimieren.
```

`src/content/tips/de/bangkok-bang-kachao.md`:

```md
---
place: bangkok
number: "10+1"
order: 11
title: Auftanken auf Bang Kachao
category: nature
coords: [13.7073638, 100.5635626]
maps:
  - url: https://maps.app.goo.gl/jLVpMB1U6CkeEzeZ8
facts:
  - label: Anreise
    value: Taxi zum Wat Khlong Toei Nok Pier, dann mit dem Boot rüber (Touristenboot 40 Baht, frag nach dem kleinen lokalen Boot für 20 Baht)
  - label: Fahrräder
    value: Gleich auf der anderen Seite für den ganzen Tag mieten
  - label: Essen
    value: Hidden Woods am Fluss, Coconut Lane auf einer Kokosfarm
more:
  title: Erst in einen Park?
  text: Sri Nakhon Khuean Khan Park und Botanischer Garten.
featured: true
---
Wenn du schon oft in Bangkok warst oder mehr als nur ein paar Tage hast, mach einen Ausflug nach Bang Kachao. Das ist eine grüne Insel mitten in Bangkok: Leih dir ein Fahrrad, fahr durch die kleinen Wege, spazier am Wasser entlang, iss zu Mittag und trink richtig guten Kaffee. Für mich einer der schönsten Orte, um dem Trubel zu entkommen und ein bisschen Inselgefühl zu haben. Die Boote fahren bis zum Abend, du kommst also entspannt zurück.
```

- [ ] **Step 11: Die 14 Tipps für ganz Thailand anlegen (EN und DE)**

Alle mit `place: thailand`, ohne Nummer. Die ersten sieben sind `featured` und haben ein `tile` für die Kachel-Anordnung der Startseite (wie im Entwurf). Jede Zeile der Tabelle wird zu zwei Dateien `src/content/tips/en/<slug>.md` und `src/content/tips/de/<slug>.md` mit genau diesem Aufbau:

```md
---
place: thailand
order: <order>
title: <Titel>
category: <category>
featured: true            # nur Zeilen 1 bis 7
tile:                     # nur wenn in der Tabelle angegeben
  tone: <tone>
  size: <size>
---
<Text>
```

| order | slug | category | tile | EN title | EN text | DE title | DE text |
|---|---|---|---|---|---|---|---|
| 1 | thailand-pad-krapao | food | tone card, size tall | Pad Krapao Moo with a kai dao | Minced pork stir-fried with chili, garlic and Thai basil, served with rice. It's very spicy, so order medium or not spicy, and get a 'kai dao' (fried egg) on top. You can have it with chicken, beef or shrimp too. | Pad Krapao Moo mit Kai Dao | Hackfleisch vom Schwein, mit Chili, Knoblauch und Thai-Basilikum gebraten, dazu Reis. Es ist sehr scharf, also bestell medium oder nicht scharf und nimm ein 'Kai Dao' (Spiegelei) obendrauf. Gibt es auch mit Hähnchen, Rind oder Garnelen. |
| 2 | thailand-mango-sticky-rice | food | tone red | Mango sticky rice | For me, the best dessert, I cannot get enough of it. Make sure to try it if you like mango. | Mango Sticky Rice | Für mich das beste Dessert, ich kann nicht genug davon bekommen. Probier es unbedingt, wenn du Mango magst. |
| 3 | thailand-singha | drinks | tone sand | Singha over Chang | Grab a Singha, I think it's so much better than Chang, and watch as people go by. | Singha statt Chang | Schnapp dir ein Singha, ich finde es viel besser als Chang, und schau den Leuten zu. |
| 4 | thailand-temple-dress-code | temples | (keins) | Cover shoulders and knees | At temples, cover your shoulders and knees and take your shoes off when you see the sign (don't worry, nobody will steal them). Taking photos is totally fine, just be mindful of locals praying. | Schultern und Knie bedecken | Im Tempel bedeckst du Schultern und Knie und ziehst die Schuhe aus, sobald du das Schild siehst (keine Sorge, die klaut niemand). Fotografieren ist völlig in Ordnung, nimm nur Rücksicht auf Einheimische, die beten. |
| 5 | thailand-massage | wellness | tone ink | Who goes to Thailand and does not get a massage? | A 60 min aroma massage at a nice spa is about 1,300 Baht, regular salons charge 10 to 20 dollars an hour. I'd go for an oil or a foot massage and check the Google Maps reviews first. | Wer fährt nach Thailand und lässt sich nicht massieren? | 60 Minuten Aroma-Massage in einem schönen Spa kosten etwa 1.300 Baht, normale Salons 10 bis 20 Dollar pro Stunde. Ich würde eine Öl- oder Fußmassage nehmen und vorher die Google-Maps-Bewertungen checken. |
| 6 | thailand-spicy | markets | tone sand, size wide | Tell the vendors if you don't like spicy | And as a general rule, I would avoid eating raw fish at markets. | Sag am Stand, wenn du es nicht scharf magst | Und als Faustregel: Rohen Fisch würde ich auf Märkten nicht essen. |
| 7 | thailand-dried-mango | shopping | tone card | Bring back dried mango | Brands like H&M or Zara are more expensive here than in Europe. Fill your suitcase with dried mango and souvenirs instead, everyone back home loves it. | Bring getrocknete Mango mit | Marken wie H&M oder Zara sind hier teurer als in Europa. Füll deinen Koffer lieber mit getrockneter Mango und Souvenirs, das lieben alle zu Hause. |
| 8 | thailand-gai-pad-med-mamuang | food | (keins) | Gai Pad Med Mamuang | Chicken fried with vegetables and cashew nuts, Mike's favourite. It's not very spicy, so if you don't really eat spicy, this one is for you. | Gai Pad Med Mamuang | Hähnchen mit Gemüse und Cashewnüssen gebraten, Mikes Liebling. Es ist kaum scharf, also genau das Richtige, wenn du eigentlich nicht scharf isst. |
| 9 | thailand-pad-see-ew | food | (keins) | Pad See Ew | If you like noodles: stir-fried with soy sauce only, so it's not spicy, and you can have it with any protein. | Pad See Ew | Wenn du Nudeln magst: nur mit Sojasoße gebraten, also nicht scharf, und mit Fleisch, Garnelen oder Tofu nach Wahl. |
| 10 | thailand-fruit-shakes | drinks | (keins) | Fruit shakes without sugar | Fruit shakes are sold everywhere and they're extremely good. Try pineapple, coconut and banana. They add sugar syrup by default, so say 'mai ao namdtan' if you want it without. | Fruchtshakes ohne Zucker | Fruchtshakes gibt es überall und sie sind richtig gut. Probier Ananas, Kokos und Banane. Standardmäßig kommt Zuckersirup rein, also sag 'mai ao namdtan', wenn du ihn ohne willst. |
| 11 | thailand-coconut-ice-cream | food | (keins) | Coconut ice cream from the cart | Look out for the guys with little ice cream carts, they ring a bell to let you know they're coming. | Kokoseis vom Wagen | Halt Ausschau nach den Männern mit den kleinen Eiswagen, sie klingeln mit einer Glocke, damit du weißt, dass sie kommen. |
| 12 | thailand-vegetarian | food | (keins) | Vegan or vegetarian? | No problem: most dishes come with a tofu option, and it's fairly easy in Thailand to get food without meat. | Vegan oder vegetarisch? | Kein Problem: Die meisten Gerichte gibt es mit Tofu, und fleischloses Essen bekommst du in Thailand ziemlich leicht. |
| 13 | thailand-grand-palace-scam | getting-around | (keins) | The Grand Palace is basically never closed | If a TukTuk driver tells you it is, he wants to take you to five jewelry stores. Don't let him. | Der Grand Palace hat so gut wie nie zu | Wenn dir ein TukTuk-Fahrer erzählt, er sei geschlossen, will er dich zu fünf Schmuckläden fahren. Lass dich nicht darauf ein. |
| 14 | thailand-bargain | markets | (keins) | Bargain at the markets | There usually won't be prices displayed, which means: bargain your heart out. | Auf Märkten handeln | Meistens stehen keine Preise dran, also: handeln, was das Zeug hält. |

Titel mit `?` oder `'` in YAML in doppelte Anführungszeichen setzen. Beispiel für Zeile 6 auf Englisch, `src/content/tips/en/thailand-spicy.md`:

```md
---
place: thailand
order: 6
title: "Tell the vendors if you don't like spicy"
category: markets
featured: true
tile:
  tone: sand
  size: wide
---
And as a general rule, I would avoid eating raw fish at markets.
```

- [ ] **Step 12: Restaurants und "würde ich auslassen" anlegen**

Jede Zeile wird zu `src/content/restaurants/en/<slug>.md` und `src/content/restaurants/de/<slug>.md`:

```md
---
place: bangkok
name: <Name>
cuisine: thai
order: <order>
price: <Preis in der jeweiligen Sprache>
mapsUrl: "<mapsUrl>"
coords: [<lat>, <lng>]     # nur wenn in der Tabelle angegeben
---
<Text>
```

| order | slug | name | coords | mapsUrl |
|---|---|---|---|---|
| 1 | bangkok-the-local | The Local | (keine) | https://www.google.com/maps/search/?api=1&query=The+Local+by+Oam+Thong+Bangkok |
| 2 | bangkok-shamballa-somtam | Shamballa Somtam | (keine) | https://www.google.com/maps/search/?api=1&query=Shamballa+Somtam+Ari+Bangkok |
| 3 | bangkok-taling-pling | Taling Pling Sukhumvit 34 | 13.724592, 100.573139 | https://www.google.com/maps/search/?api=1&query=Taling+Pling+Sukhumvit+34+Bangkok |
| 4 | bangkok-naam-1608 | NAAM 1608 | 13.735915, 100.509986 | https://www.google.com/maps/search/?api=1&query=NAAM+1608+Bangkok |
| 5 | bangkok-nhong-rim-klong | Nhong Rim Klong | 13.741323, 100.58864 | https://www.google.com/maps/search/?api=1&query=Nhong+Rim+Klong+Bangkok |
| 6 | bangkok-baan-suan-sathon | Baan Suan Sathon | (keine) | https://www.google.com/maps/search/?api=1&query=Baan+Suan+Sathon+Bangkok |
| 7 | bangkok-supanniga-tha-tian | Supanniga Eating Room, Tha Tian | (keine) | https://www.google.com/maps/search/?api=1&query=Supanniga+Eating+Room+Tha+Tian+Bangkok |
| 8 | bangkok-mae-varee | Mae Varee | 13.723971, 100.579329 | https://www.google.com/maps/search/?api=1&query=Mae+Varee+Bangkok |

| slug | EN price | EN text | DE price | DE text |
|---|---|---|---|---|
| bangkok-the-local | 10 to 14 € per dish | Extremely high quality, delicious Thai dishes and a very traditional decor. They serve unlimited rice with all dishes. On the pricier end, but if you're in for a treat, that's your place. | 10 bis 14 € pro Gericht | Extrem hochwertige, köstliche Thai-Gerichte und eine sehr traditionelle Einrichtung. Zu allen Gerichten gibt es Reis, so viel du willst. Eher im oberen Preisbereich, aber wenn du dir was gönnen willst, bist du hier richtig. |
| bangkok-shamballa-somtam | about 4 € per dish | Conveniently located in one of my favourite neighborhoods, Ari, with all of the delicious Thai food. Not street food cheap, but almost. | etwa 4 € pro Gericht | Praktischerweise in einem meiner Lieblingsviertel, Ari, mit all dem leckeren Thai-Essen. Nicht ganz so günstig wie Streetfood, aber fast. |
| bangkok-taling-pling | 6 to 7 € per dish | They have several branches, but this one has a very cute garden with a little pond, and any Thai dish you could wish for. | 6 bis 7 € pro Gericht | Es gibt mehrere Filialen, aber diese hat einen total süßen Garten mit kleinem Teich und jedes Thai-Gericht, das du dir wünschen kannst. |
| bangkok-naam-1608 | 8 to 9 € per dish | Right at the Chao Phraya river, with very nice outdoor seating looking over the water, seeing the boats go by while you have lunch or dinner. The food is really good too. | 8 bis 9 € pro Gericht | Direkt am Chao Phraya, mit sehr schönen Plätzen draußen mit Blick aufs Wasser, wo du beim Mittag- oder Abendessen den Booten zuschaust. Das Essen ist auch richtig gut. |
| bangkok-nhong-rim-klong | 8 to 10 € per dish | More of a canteen style, plastic chair kind of vibe, but the food definitely makes up for the lack of chic ambience. They're specialized in seafood and it's sooo good! | 8 bis 10 € pro Gericht | Eher Kantinenstil mit Plastikstühlen, aber das Essen macht das fehlende schicke Ambiente locker wett. Sie sind auf Seafood spezialisiert, und das ist sooo gut! |
| bangkok-baan-suan-sathon | 8 to 9 € per dish | The opposite: a super cute restaurant and cafe where you sit in absolute greenery, with an artificial waterfall and a pond with koi. The food is good but not extraordinary, the place is super cute though. | 8 bis 9 € pro Gericht | Das Gegenteil: ein super süßes Restaurant mit Café, in dem du mitten im Grünen sitzt, mit künstlichem Wasserfall und Koi-Teich. Das Essen ist gut, aber nicht außergewöhnlich, dafür ist der Ort richtig schön. |
| bangkok-supanniga-tha-tian | 8 to 18 € per dish | A fabulous restaurant with a beautiful view right on Wat Arun, especially beautiful after sunset. It's basically always fully booked, so make sure to reserve online before you go. | 8 bis 18 € pro Gericht | Ein fabelhaftes Restaurant mit wunderschönem Blick direkt auf den Wat Arun, besonders nach Sonnenuntergang. Es ist praktisch immer ausgebucht, also reservier vorher online. |
| bangkok-mae-varee | 2.50 to 4 € | For mango sticky rice. That's the only thing they sell, and people are usually queuing up in front. | 2,50 bis 4 € | Für Mango Sticky Rice. Das ist das Einzige, was sie verkaufen, und meistens steht eine Schlange davor. |

`src/content/skips/en/sky-bar-lebua.md`:

```md
---
title: Sky Bar at Lebua
order: 1
insteadTip: bangkok-tichuca
---
The one from The Hangover. The view is not that amazing, it's pretty dead, the vibe isn't great and the drinks are just outrageously expensive.
```

`src/content/skips/de/sky-bar-lebua.md`:

```md
---
title: Sky Bar im Lebua
order: 1
insteadTip: bangkok-tichuca
---
Die aus Hangover. Die Aussicht ist gar nicht so besonders, es ist ziemlich tot, die Stimmung ist mau und die Drinks sind einfach unverschämt teuer.
```

- [ ] **Step 13: Inhaltstests, Typprüfung und Bau laufen lassen**

Run: `npm test && npm run check && npm run build`
Expected: Vitest PASS (alle Unit-Tests inkl. `content-files`); `astro check` 0 errors, 0 warnings; Build "Complete!" (die Startseite nutzt die Inhalte noch nicht, das Schema wird beim Sync trotzdem geprüft).

Wenn `content-files` einen Unterschied meldet: die genannte Datei mit ihrem Gegenstück vergleichen und nur die sprachunabhängigen Felder angleichen.

- [ ] **Step 14: Commit**

```bash
git add -A
git commit -m "feat: Inhaltsmodell mit Sprachprüfung und alle Bangkok- und Thailand-Texte

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 3: Eigene Fotos von Wix übernehmen

**Files:**
- Create: `scripts/lib/photos.ts`, `scripts/fetch-wix-photos.ts`
- Create: `src/assets/photos/bangkok/*.jpg`
- Modify: `src/content/places/{en,de}/bangkok.md`, `src/content/tips/{en,de}/bangkok-*.md`, `src/content/tips/{en,de}/thailand-pad-krapao.md`, `src/content/tips/{en,de}/thailand-temple-dress-code.md`
- Test: `tests/unit/content-files.test.ts` (besteht schon; prüft, dass jedes referenzierte Foto existiert)

**Interfaces:**
- Produces: `savePhoto(input: Buffer, target: string): Promise<void>` und `download(url: string): Promise<Buffer>` aus `scripts/lib/photos.ts` (Task 11 nutzt sie). Fotodateien unter `src/assets/photos/bangkok/` mit den Namen aus Step 3.

- [ ] **Step 1: Die Autorin fragen (AskUserQuestion, drei Fragen in einem Aufruf)**

1. "Darf ich diese eigenen Fotos von deiner Wix-Seite in voller Auflösung herunterladen? Quelle static.wixstatic.com, je Foto etwa 1 bis 8 MB, sie werden danach auf höchstens 2400 px verkleinert und GPS-Daten werden entfernt: Wat Paknam (1, 2, 3), TukTuk (10, 11), Chinatown (14, 15), Khao San (25, 27), Bang Kachao Coconut Lane (33)." Optionen: Ja / Nein.
2. "Sind diese Fotos von dir? Tichuca-Terrasse (7), Tichuca-Sonnenuntergang (8), Pad Krapao (22, Bildschirmfoto), Garnelen in Tamarindensoße (24, Bildschirmfoto)." multiSelect, eine Option pro Foto, plus "Keins davon".
3. "Sind die Personen auf diesen Fotos einverstanden, dass sie öffentlich zu sehen sind? Barkeeper mit Cocktail-Schild (26), ihr zwei im Boot (31), Radfahrer auf Bang Kachao (32)." multiSelect, eine Option pro Foto, plus "Keins davon".

Nur Fotos herunterladen, die in Frage 1 freigegeben oder in Frage 2 und 3 ausgewählt wurden.

- [ ] **Step 2: Foto-Helfer und Download-Skript schreiben**

```bash
npm i -D sharp
```

`scripts/lib/photos.ts`:

```ts
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
```

`scripts/fetch-wix-photos.ts`:

```ts
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
```

- [ ] **Step 3: Freigegebene Fotos herunterladen**

Immer (wenn Frage 1 mit Ja beantwortet): `1 2 3 10 11 14 15 25 27 33`, plus die in Frage 2 und 3 gewählten Nummern. Beispiel ohne Zusatzfotos:

```bash
node scripts/fetch-wix-photos.ts 1 2 3 10 11 14 15 25 27 33
ls -la src/assets/photos/bangkok/
```

Expected: eine `.jpg` pro Nummer, jede unter 1,5 MB.

- [ ] **Step 4: Fotos in die Inhalte eintragen (EN und DE, gleiche `src`, übersetzte `alt`)**

Pfade sind relativ zur Markdown-Datei: `../../../assets/photos/bangkok/<datei>`. In `src/content/places/<lang>/bangkok.md` ein `cover` ergänzen, in den Tipps ein `photos`-Feld. Einträge mit (\*) nur, wenn das Foto in Step 1 freigegeben wurde.

| Datei | Feld | Foto | position | alt EN | alt DE |
|---|---|---|---|---|---|
| places/bangkok | cover | wat-paknam-buddha.jpg | 55% 50% | The giant golden Buddha next to the white stupa of Wat Paknam | Der riesige goldene Buddha neben der weißen Stupa von Wat Paknam |
| tips/bangkok-wat-paknam | photos | wat-paknam-emerald-pagoda.jpg | | The emerald pagoda under the painted ceiling on the top floor | Die smaragdgrüne Pagode unter der bemalten Decke im obersten Stockwerk |
| | | wat-paknam-golden-buddha.jpg | 50% 25% | The golden Buddha statue from behind | Die goldene Buddha-Statue von hinten |
| tips/bangkok-tuktuk | photos | tuktuk-night.jpg | | A TukTuk with green lights at night | Ein TukTuk mit grüner Beleuchtung bei Nacht |
| | | tuktuk-black-white.jpg | | A parked TukTuk in black and white | Ein geparktes TukTuk in Schwarz-Weiß |
| tips/bangkok-chinatown | photos | chinatown-street-food.jpg | | Street food under neon signs in Chinatown | Streetfood unter Neonschildern in Chinatown |
| | | chinatown-food-stall.jpg | | A street food stall in Chinatown at night | Ein Streetfood-Stand in Chinatown bei Nacht |
| tips/bangkok-khao-san | photos | khao-san-crowd.jpg | | The crowd on Khao San Road at night | Menschenmenge auf der Khao San Road bei Nacht |
| | | khao-san-neon.jpg | | A neon-lit corridor in a bar on Khao San Road | Ein neonbeleuchteter Gang in einer Bar auf der Khao San Road |
| | | khao-san-cocktails.jpg (\*26) | | Strong cocktails advertised on Khao San Road | Starke Cocktails auf der Khao San Road |
| tips/bangkok-bang-kachao | photos | bang-kachao-bike.jpg (\*32) | 50% 40% | Biking along a narrow path through the jungle on Bang Kachao | Mit dem Fahrrad auf einem schmalen Weg durch den Dschungel von Bang Kachao |
| | | bang-kachao-coconut-lane.jpg | | Lunch on a terrace overlooking the coconut farm | Mittagessen auf einer Terrasse mit Blick auf die Kokosfarm |
| | | bang-kachao-boat.jpg (\*31) | | On the boat across the river to Bang Kachao | Im Boot über den Fluss nach Bang Kachao |
| tips/bangkok-tichuca | photos | tichuca-sunset.jpg (\*8) | | Sunset over the skyline from Tichuca | Sonnenuntergang über der Skyline vom Tichuca aus |
| | | tichuca-terrace.jpg (\*7) | | The terrace of Tichuca with its jellyfish-like light installation | Die Terrasse des Tichuca mit der quallenartigen Lichtinstallation |
| tips/bangkok-street-food | photos | pad-krapao.jpg (\*22) | | Pad Krapao with rice and a fried egg | Pad Krapao mit Reis und Spiegelei |
| | | tamarind-prawns.jpg (\*24) | | Prawns in tamarind sauce | Garnelen in Tamarindensoße |
| tips/thailand-pad-krapao | photos | pad-krapao.jpg (\*22), sonst chinatown-food-stall.jpg | | Pad Krapao with rice and a fried egg / A street food stall at night | Pad Krapao mit Reis und Spiegelei / Ein Streetfood-Stand bei Nacht |
| tips/thailand-temple-dress-code | photos | wat-paknam-golden-buddha.jpg | 50% 30% | The golden Buddha statue at Wat Paknam | Die goldene Buddha-Statue im Wat Paknam |

Beispiel, `src/content/tips/de/bangkok-wat-paknam.md` (nach `featured: true` einfügen):

```yaml
photos:
  - src: ../../../assets/photos/bangkok/wat-paknam-emerald-pagoda.jpg
    alt: Die smaragdgrüne Pagode unter der bemalten Decke im obersten Stockwerk
  - src: ../../../assets/photos/bangkok/wat-paknam-golden-buddha.jpg
    alt: Die goldene Buddha-Statue von hinten
    position: 50% 25%
```

Beispiel, `src/content/places/en/bangkok.md` (nach `heroLabel`):

```yaml
cover:
  src: ../../../assets/photos/bangkok/wat-paknam-buddha.jpg
  alt: The giant golden Buddha next to the white stupa of Wat Paknam
  position: 55% 50%
```

- [ ] **Step 5: Tests und Bau laufen lassen**

Run: `npm test && npm run build`
Expected: PASS; der Build meldet keine "ImageNotFound"-Fehler.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: eigene Fotos von Wix übernommen und den Tipps zugeordnet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 4: Ortsseite mit Tipp-Karten und Filter

**Files:**
- Create: `src/lib/categories.ts`, `src/lib/active.ts`, `src/scripts/motion.ts`, `src/scripts/filter.ts`, `src/scripts/scroll-active.ts`
- Create: `src/components/ArchPhoto.astro`, `src/components/FilterBar.astro`, `src/components/TipCard.astro`
- Create: `src/pages/[lang]/destinations/[place]/index.astro`
- Test: `tests/unit/categories.test.ts`, `tests/unit/active.test.ts`, `tests/e2e/place.spec.ts`

**Interfaces:**
- Consumes: `getPlaces`, `getTips`, `Localized` (Task 2); `t`, `pathFor`, `BaseLayout` (Task 1).
- Produces:
  - `FilterOption = { key: string; label: string; count: number }`, `countOptions<K extends string>(keys: readonly K[], order: readonly K[], label: (key: K) => string): FilterOption[]`, `matchesFilter(key: string, category: string | undefined): boolean`
  - `ActiveCandidate = { id: string; top: number; bottom: number; hidden: boolean }`, `pickActive(items: ActiveCandidate[], target: number): string | null`
  - `reducedMotion(): boolean`; `initFilters(): void` (Markup-Vertrag: Wurzel `[data-filter-root]`, Buttons `[data-filter-chip][data-category]` mit `aria-pressed`, Einträge `[data-filter-item][data-category]`, Liste `[data-filter-list]`; feuert `tv:filter` mit `detail: { key: string }`, bubbelt bis `document`)
  - `watchActive(items: HTMLElement[], onChange: (id: string | null) => void): void` (liest `data-active-id`, setzt Klasse `is-active`)
  - Komponenten: `ArchPhoto { src: ImageMetadata; alt: string; ratio?: string; position?: string; eager?: boolean; sizes?: string }`, `FilterBar { lang: Lang; options: FilterOption[]; total: number }`, `TipCard { lang: Lang; tip: Localized<'tips'> }` (rendert `<article id="tip-<slug>" data-filter-item data-category data-active-id="<slug>">`)
  - Seite `/<lang>/destinations/<place>/` für jeden Ort mit mindestens einem Tipp; Liste `#tips`.

- [ ] **Step 1: Failing Unit-Tests schreiben**

`tests/unit/categories.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { countOptions, matchesFilter } from '../../src/lib/categories';

describe('countOptions', () => {
  it('counts keys and orders them like the master list, skipping unused ones', () => {
    const options = countOptions(['food', 'temples', 'food'], ['temples', 'markets', 'food'] as const, (k) => k.toUpperCase());
    expect(options).toEqual([
      { key: 'temples', label: 'TEMPLES', count: 1 },
      { key: 'food', label: 'FOOD', count: 2 },
    ]);
  });
});

describe('matchesFilter', () => {
  it('shows everything for "all" and only matching items otherwise', () => {
    expect(matchesFilter('all', 'food')).toBe(true);
    expect(matchesFilter('food', 'food')).toBe(true);
    expect(matchesFilter('food', 'temples')).toBe(false);
    expect(matchesFilter('food', undefined)).toBe(false);
  });
});
```

`tests/unit/active.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { pickActive } from '../../src/lib/active';

describe('pickActive', () => {
  it('picks the visible item whose centre is closest to the target line', () => {
    expect(pickActive([
      { id: 'a', top: -400, bottom: -100, hidden: false },
      { id: 'b', top: 200, bottom: 500, hidden: false },
      { id: 'c', top: 600, bottom: 900, hidden: false },
    ], 400)).toBe('b');
  });

  it('ignores hidden and collapsed items', () => {
    expect(pickActive([
      { id: 'a', top: 350, bottom: 450, hidden: true },
      { id: 'b', top: 0, bottom: 0, hidden: false },
      { id: 'c', top: 700, bottom: 900, hidden: false },
    ], 400)).toBe('c');
  });

  it('returns null when nothing is visible', () => {
    expect(pickActive([], 400)).toBeNull();
  });
});
```

Run: `npx vitest run tests/unit/categories.test.ts tests/unit/active.test.ts`
Expected: FAIL, Module nicht gefunden.

- [ ] **Step 2: Reine Helfer schreiben**

`src/lib/categories.ts`:

```ts
export interface FilterOption {
  key: string;
  label: string;
  count: number;
}

export function countOptions<K extends string>(keys: readonly K[], order: readonly K[], label: (key: K) => string): FilterOption[] {
  const counts = new Map<K, number>();
  for (const key of keys) counts.set(key, (counts.get(key) ?? 0) + 1);
  return order.filter((key) => counts.has(key)).map((key) => ({ key, label: label(key), count: counts.get(key) ?? 0 }));
}

export function matchesFilter(key: string, category: string | undefined): boolean {
  return key === 'all' || category === key;
}
```

`src/lib/active.ts`:

```ts
export interface ActiveCandidate {
  id: string;
  top: number;
  bottom: number;
  hidden: boolean;
}

export function pickActive(items: ActiveCandidate[], target: number): string | null {
  let best: string | null = null;
  let bestDistance = Infinity;
  for (const item of items) {
    if (item.hidden || item.bottom - item.top <= 0) continue;
    const distance = Math.abs((item.top + item.bottom) / 2 - target);
    if (distance < bestDistance) {
      bestDistance = distance;
      best = item.id;
    }
  }
  return best;
}
```

Run: `npx vitest run tests/unit/categories.test.ts tests/unit/active.test.ts`
Expected: PASS (5 Tests).

- [ ] **Step 3: Failing E2E-Tests für die Bangkok-Seite schreiben**

`tests/e2e/place.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test';
import { collectPageErrors, expectNoHorizontalScroll } from './helpers';

const tips = (page: Page) => page.locator('#tips [data-filter-item]');

test('Bangkok shows all eleven tips in order', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await expect(page.getByRole('heading', { level: 1, name: 'Bangkok' })).toBeVisible();
  await expect(tips(page)).toHaveCount(11);
  await expect(tips(page).first().getByRole('heading', { level: 3 })).toHaveText('Wat Paknam Phasi Charoen');
  await expect(tips(page).last().getByRole('heading', { level: 3 })).toHaveText('Recharge on Bang Kachao');
});

test('the filter shows only the chosen category and can be reset', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.goto('/en/destinations/bangkok/');
  await page.getByRole('button', { name: /^Nightlife/ }).click();
  await expect(page.getByRole('button', { name: /^Nightlife/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(tips(page).filter({ visible: true })).toHaveCount(2);
  await page.getByRole('button', { name: /^All/ }).click();
  await expect(tips(page).filter({ visible: true })).toHaveCount(11);
  expect(errors).toEqual([]);
});

test('the filter works with the keyboard alone', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await page.getByRole('button', { name: /^Temples/ }).focus();
  await page.keyboard.press('Enter');
  await expect(tips(page).filter({ visible: true })).toHaveCount(1);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Space');
  await expect(page.getByRole('button', { name: /^Markets/ })).toHaveAttribute('aria-pressed', 'true');
  await expect(tips(page).filter({ visible: true })).toHaveCount(1);
});

test('the German page uses German labels and texts', async ({ page }) => {
  await page.goto('/de/destinations/bangkok/');
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
  await expect(page.getByRole('button', { name: /^Nachtleben/ })).toBeVisible();
  await expect(page.getByRole('heading', { level: 3, name: 'Steig in ein TukTuk' })).toBeVisible();
});

test('places without tips have no page', async ({ request }) => {
  expect((await request.get('/en/destinations/koh-phangan/')).status()).toBe(404);
});

test('maps buttons open the original Google Maps links in a new tab', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  const link = page.locator('#tip-bangkok-wat-paknam').getByRole('link', { name: 'Open in Google Maps ↗' });
  await expect(link).toHaveAttribute('href', 'https://maps.app.goo.gl/GZJXQkbFn25JmQFZA');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(page.locator('#tip-bangkok-massage').getByRole('link', { name: 'Divana on Google Maps ↗' })).toBeVisible();
});

test('the street food tip links to the food page', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await expect(page.getByRole('link', { name: 'My favorite restaurants in Bangkok →' })).toHaveAttribute('href', '/en/destinations/bangkok/food/');
});

test('on phones the chips scroll sideways, the page does not', async ({ page }, info) => {
  test.skip(info.project.name !== 'mobile', 'mobile only');
  await page.goto('/de/destinations/bangkok/');
  const scrollable = await page.locator('[data-filter-root] [role="group"]').evaluate((el) => el.scrollWidth > el.clientWidth);
  expect(scrollable).toBe(true);
  await expectNoHorizontalScroll(page);
});
```

- [ ] **Step 4: Browser-Skripte schreiben**

`src/scripts/motion.ts`:

```ts
export function reducedMotion(): boolean {
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}
```

`src/scripts/filter.ts`:

```ts
import { matchesFilter } from '../lib/categories';
import { reducedMotion } from './motion';

export interface FilterDetail {
  key: string;
}

export function initFilters(): void {
  document.querySelectorAll<HTMLElement>('[data-filter-root]').forEach((root) => {
    if (root.dataset.filterReady) return;
    root.dataset.filterReady = 'true';
    const chips = [...root.querySelectorAll<HTMLButtonElement>('[data-filter-chip]')];
    const items = [...root.querySelectorAll<HTMLElement>('[data-filter-item]')];
    const list = root.querySelector<HTMLElement>('[data-filter-list]');

    for (const chip of chips) {
      chip.addEventListener('click', () => {
        const key = chip.dataset.category ?? 'all';
        for (const other of chips) other.setAttribute('aria-pressed', String(other === chip));
        for (const item of items) item.hidden = !matchesFilter(key, item.dataset.category);
        root.dispatchEvent(new CustomEvent<FilterDetail>('tv:filter', { bubbles: true, detail: { key } }));
        if (list && list.getBoundingClientRect().top < 0) {
          list.scrollIntoView({ block: 'start', behavior: reducedMotion() ? 'auto' : 'smooth' });
        }
      });
    }
  });
}
```

`src/scripts/scroll-active.ts`:

```ts
import { pickActive } from '../lib/active';

export function watchActive(items: HTMLElement[], onChange: (id: string | null) => void): void {
  let current: string | null | undefined;
  let frame = 0;

  const run = () => {
    frame = 0;
    const id = pickActive(
      items.map((el) => {
        const rect = el.getBoundingClientRect();
        return { id: el.dataset.activeId ?? '', top: rect.top, bottom: rect.bottom, hidden: el.hidden };
      }),
      window.innerHeight * 0.45,
    );
    if (id === current) return;
    current = id;
    for (const el of items) el.classList.toggle('is-active', el.dataset.activeId === id);
    onChange(id);
  };
  const schedule = () => {
    if (!frame) frame = requestAnimationFrame(run);
  };

  document.addEventListener('scroll', schedule, { passive: true, capture: true });
  window.addEventListener('resize', schedule);
  document.addEventListener('tv:filter', schedule);
  run();
}
```

- [ ] **Step 5: Komponenten schreiben**

`src/components/ArchPhoto.astro`:

```astro
---
import type { ImageMetadata } from 'astro';
import { Picture } from 'astro:assets';

interface Props {
  src: ImageMetadata;
  alt: string;
  ratio?: string;
  position?: string;
  eager?: boolean;
  sizes?: string;
}

const { src, alt, ratio = '4 / 5', position, eager = false, sizes = '(max-width: 900px) 92vw, 40vw' } = Astro.props;
---
<div class="arch" style={`--ratio: ${ratio}`}>
  <Picture
    src={src}
    alt={alt}
    formats={['avif', 'webp']}
    widths={[480, 800, 1200, 1600]}
    sizes={sizes}
    loading={eager ? 'eager' : 'lazy'}
    fetchpriority={eager ? 'high' : undefined}
    style={position ? `object-position: ${position}` : undefined}
  />
</div>

<style>
  .arch { border-radius: 999px 999px 12px 12px; overflow: hidden; aspect-ratio: var(--ratio); }
  .arch :global(picture), .arch :global(img) { display: block; width: 100%; height: 100%; object-fit: cover; }
</style>
```

`src/components/FilterBar.astro`:

```astro
---
import { t } from '../i18n';
import type { Lang } from '../i18n/types';
import type { FilterOption } from '../lib/categories';

interface Props {
  lang: Lang;
  options: FilterOption[];
  total: number;
}

const { lang, options, total } = Astro.props;
const d = t(lang);
---
<div class="chips" role="group" aria-label={d.filter.label}>
  <button type="button" class="chip" data-filter-chip data-category="all" aria-pressed="true">{d.filter.all}{' '}<small>{total}</small></button>
  {options.map((option) => (
    <button type="button" class="chip" data-filter-chip data-category={option.key} aria-pressed="false">{option.label}{' '}<small>{option.count}</small></button>
  ))}
</div>

<script>
  import { initFilters } from '../scripts/filter';
  initFilters();
</script>

<style>
  .chips { display: flex; flex-wrap: wrap; gap: 8px; padding: 14px 0; }
  .chip { border: 1px solid rgb(42 33 27 / 0.2); border-radius: 99px; padding: 7px 15px; font: inherit; font-size: clamp(13px, 0.9vw, 15px); line-height: 1.3; cursor: pointer; background: transparent; color: inherit; }
  .chip small { opacity: 0.7; font-size: 0.85em; }
  .chip[aria-pressed='true'] { background: var(--red); border-color: var(--red); color: var(--bg); }
  .chip[aria-pressed='true'] small { opacity: 0.85; }
  @media (max-width: 900px) {
    .chips { flex-wrap: nowrap; overflow-x: auto; scrollbar-width: none; margin: 0 calc(-1 * var(--pad)); padding: 12px var(--pad); }
    .chips::-webkit-scrollbar { display: none; }
    .chip { flex: none; }
  }
</style>
```

`src/components/TipCard.astro`:

```astro
---
import { Picture } from 'astro:assets';
import { render } from 'astro:content';
import { t } from '../i18n';
import type { Lang } from '../i18n/types';
import type { Localized } from '../lib/content';
import { pathFor } from '../lib/urls';

interface Props {
  lang: Lang;
  tip: Localized<'tips'>;
}

const { lang, tip } = Astro.props;
const d = t(lang);
const data = tip.entry.data;
const { Content } = await render(tip.entry);
const photos = data.photos;
const leadTall = photos.length > 0 && photos[0].src.height > photos[0].src.width;
---
<article
  class:list={['tip', { 'has-photos': photos.length > 0 }]}
  id={`tip-${tip.slug}`}
  data-filter-item
  data-category={data.category}
  data-active-id={tip.slug}
>
  {data.number && <div class="num" aria-hidden="true">{data.number}</div>}
  <div class="main">
    <p class="label">{d.category[data.category]}{data.pinNote && <span class="pin-note">{` ${data.pinNote}`}</span>}</p>
    <h3>{data.title}</h3>
    <div class="text"><Content /></div>
    {data.facts.length > 0 && (
      <dl class="facts">
        {data.facts.map((fact) => (
          <Fragment><dt>{fact.label}</dt><dd>{fact.value}</dd></Fragment>
        ))}
      </dl>
    )}
    {data.more && (
      <div class="more"><b>{data.more.title}</b><p>{data.more.text}</p></div>
    )}
    {data.skip && (
      <div class="skip-note"><b>{d.place.iWouldSkip}</b><p>{data.skip}</p></div>
    )}
    {(data.maps.length > 0 || data.link) && (
      <div class="actions">
        {data.maps.map((m) => (
          <a class="btn" href={m.url} target="_blank" rel="noopener">{m.label ? d.place.openNamedInMaps(m.label) : d.place.openInMaps}</a>
        ))}
        {data.link && <a class="btn btn-ghost" href={pathFor(lang, data.link.href)}>{data.link.label}</a>}
      </div>
    )}
  </div>
  {photos.length > 0 && (
    <div class:list={['photos', { 'lead-tall': leadTall }]}>
      {photos.map((photo) => (
        <figure>
          <Picture
            src={photo.src}
            alt={photo.alt}
            formats={['avif', 'webp']}
            widths={[400, 700, 1000]}
            sizes="(max-width: 900px) 45vw, 22vw"
            style={photo.position ? `object-position: ${photo.position}` : undefined}
          />
          {photo.credit && (
            <figcaption>
              {`${d.photo.label}: `}<a href={photo.credit.source}>{photo.credit.author}</a>{', '}
              {photo.credit.licenseUrl ? <a href={photo.credit.licenseUrl}>{photo.credit.license}</a> : photo.credit.license}
            </figcaption>
          )}
        </figure>
      ))}
    </div>
  )}
</article>

<style>
  .tip { background: var(--card); border-radius: var(--radius); padding: clamp(20px, 2.2vw, 40px); margin-bottom: 18px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: clamp(14px, 1.6vw, 28px); transition: box-shadow 0.3s; scroll-margin-top: 90px; }
  .tip.has-photos { grid-template-columns: auto minmax(0, 1fr) minmax(0, 0.9fr); }
  .num { font-family: var(--serif); font-weight: 300; font-size: clamp(44px, 4vw, 76px); line-height: 0.9; color: var(--red); }
  .label { margin: 0; }
  .pin-note { color: var(--muted); margin-left: 6px; letter-spacing: 0.08em; }
  h3 { font-family: var(--serif); font-weight: 400; font-size: clamp(26px, 2.3vw, 44px); line-height: 1.05; margin: 8px 0 12px; letter-spacing: -0.01em; }
  .text { font-size: clamp(14px, 1.02vw, 17px); line-height: 1.65; }
  .text :global(p) { margin: 0 0 16px; }
  .facts { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; font-size: clamp(13px, 0.95vw, 15px); margin: 0 0 18px; }
  .facts dt { color: var(--muted); }
  .facts dd { margin: 0; }
  .more { border-top: 1px solid var(--line); padding-top: 14px; margin-bottom: 18px; font-size: clamp(13px, 0.95vw, 15px); }
  .more b { display: block; font-family: var(--serif); font-weight: 600; font-size: 1.1em; margin-bottom: 4px; }
  .more p, .skip-note p { margin: 0; }
  .skip-note { background: var(--ink); color: var(--bg); border-radius: 12px; padding: 14px 16px; margin-bottom: 18px; font-size: clamp(13px, 0.95vw, 15px); }
  .skip-note b { color: var(--skip); text-transform: uppercase; letter-spacing: 0.12em; font-size: 0.8em; display: block; margin-bottom: 4px; }
  .actions { display: flex; flex-wrap: wrap; gap: 10px; }
  .photos { display: grid; gap: 10px; align-content: start; }
  figure { margin: 0; }
  .photos :global(img) { display: block; width: 100%; aspect-ratio: 4 / 3; object-fit: cover; border-radius: 12px; }
  .photos.lead-tall figure:first-child :global(img) { aspect-ratio: 4 / 5; }
  figcaption { font-size: 11px; color: var(--muted); margin-top: 4px; }
  @media (max-width: 900px) {
    .tip, .tip.has-photos { grid-template-columns: 1fr; }
    .photos { grid-template-columns: 1fr 1fr; }
    .photos.lead-tall figure:first-child :global(img) { aspect-ratio: 4 / 3; }
    .num { font-size: 40px; }
  }
</style>
```

- [ ] **Step 6: Ortsseite schreiben**

`src/pages/[lang]/destinations/[place]/index.astro`:

```astro
---
import type { InferGetStaticPropsType } from 'astro';
import { render } from 'astro:content';
import ArchPhoto from '../../../../components/ArchPhoto.astro';
import FilterBar from '../../../../components/FilterBar.astro';
import TipCard from '../../../../components/TipCard.astro';
import { t } from '../../../../i18n';
import { CATEGORIES, LANGS } from '../../../../i18n/types';
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import { countOptions } from '../../../../lib/categories';
import { getPlaces, getTips } from '../../../../lib/content';
import { pathFor } from '../../../../lib/urls';

export async function getStaticPaths() {
  const paths = [];
  for (const lang of LANGS) {
    for (const place of await getPlaces(lang)) {
      const tips = await getTips(lang, place.slug);
      if (tips.length > 0) paths.push({ params: { lang, place: place.slug }, props: { lang, place, tips } });
    }
  }
  return paths;
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { lang, place, tips } = Astro.props as Props;
const d = t(lang);
const data = place.entry.data;
const { Content: Intro } = await render(place.entry);
const options = countOptions(tips.map((tip) => tip.entry.data.category), CATEGORIES, (c) => d.categories[c]);
---
<BaseLayout lang={lang} path={`destinations/${place.slug}/`} title={data.name} description={data.summary} current="destinations">
  <section class="hero wrap">
    <div>
      <p class="crumb"><a href={pathFor(lang, 'destinations/')}>{d.place.breadcrumb}</a>{' / '}{d.regions[data.region]}</p>
      <p class="label">{d.place.tipsCount(tips.length)}{data.heroLabel ? ` · ${data.heroLabel}` : ''}</p>
      <h1 class="h1">{data.name}</h1>
      <div class="intro"><Intro /></div>
    </div>
    {data.cover && <ArchPhoto src={data.cover.src} alt={data.cover.alt} position={data.cover.position} eager />}
  </section>

  <div data-filter-root>
    <div class="bar"><div class="wrap"><FilterBar lang={lang} options={options} total={tips.length} /></div></div>
    <div class="wrap body">
      <div class="tips" id="tips" data-filter-list>
        {tips.map((tip) => <TipCard lang={lang} tip={tip} />)}
      </div>
    </div>
  </div>
</BaseLayout>

<script>
  import { watchActive } from '../../../../scripts/scroll-active';
  watchActive([...document.querySelectorAll<HTMLElement>('#tips [data-active-id]')], (id) => {
    document.dispatchEvent(new CustomEvent('tv:active', { detail: { id } }));
  });
</script>

<style>
  .hero { display: grid; grid-template-columns: 1.25fr 1fr; gap: clamp(20px, 4vw, 80px); align-items: end; padding-top: clamp(16px, 3vw, 60px); padding-bottom: clamp(36px, 5vw, 90px); }
  .crumb { font-size: clamp(13px, 0.9vw, 15px); color: var(--muted); margin: 0 0 14px; }
  .crumb a { text-decoration: none; }
  .hero .label { margin: 0; }
  .h1 { font-family: var(--serif); font-weight: 300; font-size: clamp(72px, 12vw, 230px); line-height: 0.85; letter-spacing: -0.04em; margin: 10px 0 clamp(20px, 2.4vw, 40px); }
  .intro { font-family: var(--serif); font-weight: 300; font-size: clamp(16px, 1.3vw, 22px); line-height: 1.55; max-width: 34ch; }
  .intro :global(p) { margin: 0; }
  .bar { position: sticky; top: 0; z-index: 500; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .body { padding-top: clamp(24px, 3vw, 50px); }
  .tips { scroll-margin-top: 90px; }
  @media (max-width: 900px) {
    .hero { grid-template-columns: 1fr; }
    .hero :global(.arch) { aspect-ratio: 1 / 1; }
  }
</style>
```

- [ ] **Step 7: Prüfen, bauen, E2E laufen lassen**

Run: `npm run check && npm test && npm run build && npx playwright test tests/e2e/place.spec.ts tests/e2e/layout.spec.ts`
Expected: alles grün; der Test "street food tip links to the food page" prüft nur das `href` (die Zielseite entsteht in Task 8).

- [ ] **Step 8: Sichtprüfung gegen den Entwurf**

`preview_start` `tv-preview`, `/en/destinations/bangkok/` bei 1920 und 390 px neben `docs/superpowers/mockups/bangkok.html` legen: großer Ortsname, Foto im Bogen, Filterleiste klebt oben, Nummern in Tiefrot, dunkler "I would skip"-Kasten bei Tichuca. Auf dem Handy wischt die Filterleiste seitlich.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: Ortsseite mit Tipp-Karten, Filter und Fotos

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 5: Ortskarte mit MapLibre und OpenFreeMap

**Files:**
- Create: `src/lib/map-helpers.ts`, `src/scripts/place-map.ts`, `src/components/PlaceMap.astro`
- Modify: `src/pages/[lang]/destinations/[place]/index.astro`
- Test: `tests/unit/map-helpers.test.ts`, `tests/e2e/map.spec.ts`

**Interfaces:**
- Consumes: `tv:filter` (Task 4, `detail.key`), `tv:active` (Task 4, `detail.id`), `reducedMotion()` (Task 4).
- Produces:
  - `MapPin = { id: string; label: string; title: string; category: string; coords: [number, number]; anchor: string }`, `LngLat = [number, number]`, `toLngLat(coords): LngLat`, `boundsOf(points: LngLat[]): [LngLat, LngLat] | null`, `labelField(lang: Lang): unknown[]`, `pinLabel(number: string | undefined, fallback: number): string`
  - `initPlaceMaps(): void` für alle `[data-place-map]` (Daten in `data-pins` als JSON, Sprache in `data-lang`; setzt `data-map-ready` auf `pending`, `true` oder `failed`)
  - Komponente `PlaceMap { lang: Lang; pins: MapPin[]; label: string }`. Pins sind `<button class="tv-pin" aria-label="<title>"><span>label</span></button>`; Klick scrollt zu `#<anchor>`.

- [ ] **Step 1: MapLibre installieren**

```bash
npm i maplibre-gl@^6.14.0
```

- [ ] **Step 2: Failing Unit-Test für die Karten-Helfer schreiben**

`tests/unit/map-helpers.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { boundsOf, labelField, pinLabel, toLngLat } from '../../src/lib/map-helpers';

describe('map helpers', () => {
  it('turns [lat, lng] into MapLibre order', () => {
    expect(toLngLat([13.72, 100.47])).toEqual([100.47, 13.72]);
  });

  it('computes south-west and north-east corners', () => {
    expect(boundsOf([[100.47, 13.72], [100.58, 13.76], [100.5, 13.7]])).toEqual([[100.47, 13.7], [100.58, 13.76]]);
  });

  it('returns null for an empty selection so the map keeps its view', () => {
    expect(boundsOf([])).toBeNull();
  });

  it('labels the map in the page language with sensible fallbacks', () => {
    expect(labelField('en')).toEqual(['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']]);
    expect(labelField('de')).toEqual(['coalesce', ['get', 'name:de'], ['get', 'name_de'], ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']]);
  });

  it('shows tip numbers without the leading zero', () => {
    expect(pinLabel('01', 1)).toBe('1');
    expect(pinLabel('10+1', 11)).toBe('10+1');
    expect(pinLabel(undefined, 4)).toBe('4');
  });
});
```

Run: `npx vitest run tests/unit/map-helpers.test.ts`
Expected: FAIL, Modul nicht gefunden.

- [ ] **Step 3: Karten-Helfer schreiben**

`src/lib/map-helpers.ts`:

```ts
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

export function labelField(lang: Lang): unknown[] {
  return lang === 'de'
    ? ['coalesce', ['get', 'name:de'], ['get', 'name_de'], ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']]
    : ['coalesce', ['get', 'name:en'], ['get', 'name_en'], ['get', 'name']];
}

export function pinLabel(number: string | undefined, fallback: number): string {
  return number ? number.replace(/^0/, '') : String(fallback);
}
```

Run: `npx vitest run tests/unit/map-helpers.test.ts`
Expected: PASS (5 Tests).

- [ ] **Step 4: Failing E2E-Tests für die Karte schreiben**

`tests/e2e/map.spec.ts`:

```ts
import { expect, test, type Page } from '@playwright/test';
import { collectPageErrors } from './helpers';

const URL = '/en/destinations/bangkok/';
const pins = (page: Page) => page.locator('[data-place-map] .tv-pin');

async function openMap(page: Page) {
  await page.goto(URL);
  await page.locator('[data-place-map]').scrollIntoViewIfNeeded();
}

test('every tip with a fixed place gets a pin', async ({ page }) => {
  await openMap(page);
  await expect(pins(page)).toHaveCount(8);
  await expect(page.locator('[data-place-map]')).toHaveAttribute('data-map-ready', 'true');
});

test('the filter hides pins and an empty category does not break the map', async ({ page }) => {
  const errors = collectPageErrors(page);
  await openMap(page);
  await expect(pins(page)).toHaveCount(8);
  await page.getByRole('button', { name: /^Nightlife/ }).click();
  await expect(pins(page)).toHaveCount(2);
  await page.getByRole('button', { name: /^Wellness/ }).click();
  await expect(pins(page)).toHaveCount(0);
  await page.getByRole('button', { name: /^All/ }).click();
  await expect(pins(page)).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('clicking a pin scrolls to its tip', async ({ page }) => {
  await openMap(page);
  await page.getByRole('button', { name: 'Soi Cowboy' }).click();
  await expect(page.locator('#tip-bangkok-soi-cowboy')).toBeInViewport();
});

test('a pin works with the keyboard', async ({ page }) => {
  await openMap(page);
  await page.getByRole('button', { name: 'IconSiam' }).focus();
  await page.keyboard.press('Enter');
  await expect(page.locator('#tip-bangkok-iconsiam')).toBeInViewport();
});

test('the page stays usable when the map tiles cannot load', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.route('https://tiles.openfreemap.org/**', (route) => route.abort());
  await openMap(page);
  await expect(page.locator('#tips [data-filter-item]')).toHaveCount(11);
  await expect(pins(page)).toHaveCount(8);
  expect(errors).toEqual([]);
});

test('the page stays usable without WebGL', async ({ page }) => {
  const errors = collectPageErrors(page);
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext as (this: HTMLCanvasElement, type: string, options?: unknown) => unknown;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      value(this: HTMLCanvasElement, type: string, options?: unknown) {
        return type.startsWith('webgl') ? null : original.call(this, type, options);
      },
    });
  });
  await openMap(page);
  await expect(page.locator('[data-place-map]')).toHaveAttribute('data-map-ready', 'failed');
  await expect(page.locator('#tips [data-filter-item]').first()).toBeVisible();
  expect(errors).toEqual([]);
});
```

- [ ] **Step 5: Karten-Skript und Komponente schreiben**

`src/scripts/place-map.ts`:

```ts
import 'maplibre-gl/dist/maplibre-gl.css';
import workerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import type { Lang } from '../i18n/types';
import { boundsOf, labelField, toLngLat, type MapPin } from '../lib/map-helpers';
import { reducedMotion } from './motion';

const STYLE_URL = 'https://tiles.openfreemap.org/styles/positron';

export function initPlaceMaps(): void {
  document.querySelectorAll<HTMLElement>('[data-place-map]').forEach((el) => {
    if (el.dataset.mapReady) return;
    el.dataset.mapReady = 'pending';
    const observer = new IntersectionObserver((entries) => {
      if (!entries.some((entry) => entry.isIntersecting)) return;
      observer.disconnect();
      createMap(el).catch(() => {
        el.dataset.mapReady = 'failed';
      });
    }, { rootMargin: '300px' });
    observer.observe(el);
  });
}

function supportsWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    return Boolean(canvas.getContext('webgl2') ?? canvas.getContext('webgl'));
  } catch {
    return false;
  }
}

async function createMap(el: HTMLElement): Promise<void> {
  if (!supportsWebGL()) {
    el.dataset.mapReady = 'failed';
    return;
  }
  const pins = JSON.parse(el.dataset.pins ?? '[]') as MapPin[];
  const lang = (el.dataset.lang ?? 'en') as Lang;
  const { Map: MapLibreMap, Marker, NavigationControl, setWorkerUrl } = await import('maplibre-gl');
  setWorkerUrl(workerUrl);

  const smooth = !reducedMotion();
  const map = new MapLibreMap({
    container: el,
    style: STYLE_URL,
    center: [100.53, 13.73],
    zoom: 11,
    attributionControl: { compact: true },
    fadeDuration: smooth ? 300 : 0,
  });
  map.scrollZoom.disable();
  map.addControl(new NavigationControl({ showCompass: false }), 'top-left');
  map.on('error', () => {
    // Missing tiles or styles: the tips stay readable, nothing else to do.
  });

  const markers = new Map<string, { marker: InstanceType<typeof Marker>; button: HTMLButtonElement }>();
  for (const pin of pins) {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'tv-pin';
    button.setAttribute('aria-label', pin.title);
    const label = document.createElement('span');
    label.textContent = pin.label;
    button.append(label);
    button.addEventListener('click', () => {
      document.getElementById(pin.anchor)?.scrollIntoView({ block: 'center', behavior: smooth ? 'smooth' : 'auto' });
    });
    markers.set(pin.id, { marker: new Marker({ element: button }).setLngLat(toLngLat(pin.coords)).addTo(map), button });
  }

  let visible = new Set(pins.map((pin) => pin.id));
  const fit = (animate: boolean) => {
    const bounds = boundsOf(pins.filter((pin) => visible.has(pin.id)).map((pin) => toLngLat(pin.coords)));
    if (!bounds) return;
    map.fitBounds(bounds, { padding: window.innerWidth < 600 ? 36 : 70, maxZoom: 13.5, duration: animate && smooth ? 700 : 0 });
  };

  map.on('load', () => {
    for (const layer of map.getStyle().layers) {
      if (layer.type === 'symbol' && layer.layout && 'text-field' in layer.layout) {
        map.setLayoutProperty(layer.id, 'text-field', labelField(lang));
      }
    }
    map.resize();
    fit(false);
  });
  fit(false);

  document.addEventListener('tv:filter', (event) => {
    const key = (event as CustomEvent<{ key: string }>).detail.key;
    visible = new Set(pins.filter((pin) => key === 'all' || pin.category === key).map((pin) => pin.id));
    for (const [id, { marker }] of markers) {
      if (visible.has(id)) marker.addTo(map);
      else marker.remove();
    }
    fit(true);
  });
  document.addEventListener('tv:active', (event) => {
    const id = (event as CustomEvent<{ id: string | null }>).detail.id;
    for (const [pinId, { button }] of markers) button.classList.toggle('is-active', pinId === id);
  });

  el.dataset.mapReady = 'true';
}
```

`src/components/PlaceMap.astro`:

```astro
---
import type { Lang } from '../i18n/types';
import type { MapPin } from '../lib/map-helpers';

interface Props {
  lang: Lang;
  pins: MapPin[];
  label: string;
}

const { lang, pins, label } = Astro.props;
---
<div class="place-map" data-place-map data-lang={lang} data-pins={JSON.stringify(pins)} role="region" aria-label={label}></div>

<script>
  import { initPlaceMaps } from '../scripts/place-map';
  initPlaceMaps();
</script>

<style>
  .place-map { width: 100%; height: 100%; background: var(--sand); border-radius: var(--radius); overflow: hidden; }
</style>
```

- [ ] **Step 6: Karte in die Ortsseite einbauen**

In `src/pages/[lang]/destinations/[place]/index.astro`:

Imports ergänzen (zu den anderen Imports):

```ts
import PlaceMap from '../../../../components/PlaceMap.astro';
import { pinLabel, type MapPin } from '../../../../lib/map-helpers';
```

Nach der Zeile `const options = ...` ergänzen:

```ts
const pins: MapPin[] = tips.flatMap((tip, index) =>
  tip.entry.data.coords
    ? [{
        id: tip.slug,
        label: pinLabel(tip.entry.data.number, index + 1),
        title: tip.entry.data.title,
        category: tip.entry.data.category,
        coords: tip.entry.data.coords,
        anchor: `tip-${tip.slug}`,
      }]
    : [],
);
```

Den Block `<div class="wrap body">...</div>` ersetzen durch:

```astro
<div class="wrap body">
  <div class="tips" id="tips" data-filter-list>
    {tips.map((tip) => <TipCard lang={lang} tip={tip} />)}
  </div>
  {pins.length > 0 && (
    <aside class="map-col">
      <div class="map-wrap"><PlaceMap lang={lang} pins={pins} label={d.place.mapLabel} /></div>
    </aside>
  )}
</div>
```

Im `<style>`-Block die Regel `.body { ... }` ersetzen und ergänzen:

```css
.body { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: clamp(20px, 3vw, 56px); padding-top: clamp(24px, 3vw, 50px); }
.map-wrap { position: sticky; top: 76px; height: calc(100vh - 100px); max-height: 860px; }
```

und im `@media (max-width: 900px)`-Block ergänzen:

```css
.body { grid-template-columns: 1fr; }
.map-col { order: -1; }
.map-wrap { position: relative; top: 0; height: 340px; }
```

- [ ] **Step 7: Prüfen, bauen, E2E laufen lassen**

Run: `npm run check && npm test && npm run build && npx playwright test tests/e2e/map.spec.ts tests/e2e/place.spec.ts`
Expected: alles grün. Scheitert "every tip with a fixed place gets a pin" mit `data-map-ready="failed"`, startet Chromium ohne WebGL: prüfen, dass `launchOptions` aus `playwright.config.ts` greifen (`npx playwright test --project=desktop --debug`).

- [ ] **Step 8: Sichtprüfung**

`preview_start` `tv-preview`, `/de/destinations/bangkok/`: Karte rechts im Creme-Ton, Beschriftung deutsch (z. B. "Bangkok" ohne Thai-Schrift), Pin des Tipps in der Bildschirmmitte rot. Bei 390 px steht die Karte über den Tipps und alle Pins sind sichtbar.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: Ortskarte mit Pins, Filter-Kopplung und Fallback ohne Karte

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 6: Thailand-Übersicht und Destinations-Seite

**Files:**
- Create: `src/lib/geo.ts`, `src/components/ThailandMap.astro`, `src/components/PlaceCard.astro`, `src/components/WhereToGo.astro`, `src/components/SkipBlock.astro`
- Create: `src/pages/[lang]/destinations/index.astro`
- Test: `tests/unit/geo.test.ts`, `tests/e2e/destinations.spec.ts`

**Interfaces:**
- Consumes: `getPlaceOverview`, `getSkips`, `getTip`, `Localized` (Task 2); `watchActive` (Task 4).
- Produces: `thailandShape(width?: number, height?: number): { width: number; height: number; path: string; project: (coords: [number, number]) => [number, number] }`; Komponenten `ThailandMap { places: { slug: string; name: string; coords: [number, number]; labelSide: 'left' | 'right' }[]; label: string }`, `PlaceCard { lang; place: Localized<'places'>; tipCount: number; featured: Localized<'tips'>[] }` (rendert `<article class="place-card" data-active-id="<slug>">`), `WhereToGo { lang }`, `SkipBlock { lang }` (rendert `<section class="skip-block">` oder nichts).

- [ ] **Step 1: Geodaten-Pakete installieren**

```bash
npm i d3-geo@^3 topojson-client@^3 world-atlas@^2
npm i -D @types/d3-geo @types/topojson-client @types/topojson-specification
```

- [ ] **Step 2: Failing Unit-Test für den Umriss schreiben**

`tests/unit/geo.test.ts`:

```ts
import { describe, expect, it } from 'vitest';
import { thailandShape } from '../../src/lib/geo';

describe('thailandShape', () => {
  const shape = thailandShape(360, 620);

  it('draws a compact outline', () => {
    expect(shape.path.startsWith('M')).toBe(true);
    expect(shape.path.length).toBeGreaterThan(2000);
    expect(shape.path.length).toBeLessThan(15000);
  });

  it('projects Bangkok to the head of the gulf', () => {
    const [x, y] = shape.project([13.7563, 100.5018]);
    expect(x).toBeGreaterThan(130);
    expect(x).toBeLessThan(148);
    expect(y).toBeGreaterThan(275);
    expect(y).toBeLessThan(295);
  });

  it('keeps the north above Bangkok and Koh Phangan below it', () => {
    const bangkok = shape.project([13.7563, 100.5018])[1];
    expect(shape.project([19.9105, 99.8406])[1]).toBeLessThan(bangkok);
    expect(shape.project([9.7319, 100.0136])[1]).toBeGreaterThan(bangkok);
  });
});
```

Run: `npx vitest run tests/unit/geo.test.ts`
Expected: FAIL, Modul nicht gefunden.

- [ ] **Step 3: Umriss-Berechnung schreiben**

`src/lib/geo.ts`:

```ts
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
```

Run: `npx vitest run tests/unit/geo.test.ts`
Expected: PASS (3 Tests).

- [ ] **Step 4: Failing E2E-Tests schreiben**

`tests/e2e/destinations.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('all five places are listed, only Bangkok links to its page', async ({ page }) => {
  await page.goto('/en/destinations/');
  await expect(page.locator('.place-card')).toHaveCount(5);
  await expect(page.locator('.place-card[data-active-id="bangkok"]').getByRole('link', { name: 'All 11 tips →' }))
    .toHaveAttribute('href', '/en/destinations/bangkok/');
  for (const slug of ['koh-phangan', 'chiang-mai', 'chiang-rai', 'kanchanaburi']) {
    await expect(page.locator(`.place-card[data-active-id="${slug}"] a`)).toHaveCount(0);
  }
});

test('the Bangkok card lists four featured tips that link into the page', async ({ page }) => {
  await page.goto('/en/destinations/');
  const links = page.locator('.place-card[data-active-id="bangkok"] .rec a');
  await expect(links).toHaveCount(4);
  await expect(links.first()).toHaveAttribute('href', '/en/destinations/bangkok/#tip-bangkok-wat-paknam');
});

test('the Thailand map shows one pin per place and follows the scroll position', async ({ page }, info) => {
  test.skip(info.project.name !== 'desktop', 'sticky map is desktop only');
  await page.goto('/en/destinations/');
  await expect(page.locator('.thailand-map [data-pin-id]')).toHaveCount(5);
  await page.locator('.place-card[data-active-id="chiang-mai"]').evaluate((el) => el.scrollIntoView({ block: 'center' }));
  await expect(page.locator('.thailand-map [data-pin-id="chiang-mai"]')).toHaveClass(/is-active/);
});

test('the skip block points to the better alternative', async ({ page }) => {
  await page.goto('/en/destinations/');
  const block = page.locator('.skip-block');
  await expect(block.getByRole('heading', { name: 'Sky Bar at Lebua' })).toBeVisible();
  await expect(block.getByRole('link', { name: 'Go to Tichuca instead →' })).toHaveAttribute('href', '/en/destinations/bangkok/#tip-bangkok-tichuca');
});

test('the German destinations page uses German region names', async ({ page }) => {
  await page.goto('/de/destinations/');
  await expect(page.getByText('Die Hauptstadt')).toBeVisible();
  await expect(page.locator('.skip-block').getByRole('link', { name: 'Stattdessen: Tichuca →' })).toBeVisible();
});
```

- [ ] **Step 5: Komponenten schreiben**

`src/components/ThailandMap.astro`:

```astro
---
import { thailandShape } from '../lib/geo';

interface Props {
  places: { slug: string; name: string; coords: [number, number]; labelSide: 'left' | 'right' }[];
  label: string;
}

const { places, label } = Astro.props;
const shape = thailandShape();
---
<svg class="thailand-map" viewBox={`0 0 ${shape.width} ${shape.height}`} role="img" aria-label={label}>
  <path class="land" d={shape.path} />
  {places.map((place) => {
    const [x, y] = shape.project(place.coords);
    const left = place.labelSide === 'left';
    return (
      <g class="pin" data-pin-id={place.slug}>
        <circle cx={x} cy={y} r="6" />
        <text x={left ? x - 12 : x + 12} y={y + 4} text-anchor={left ? 'end' : 'start'}>{place.name}</text>
      </g>
    );
  })}
</svg>

<style>
  .thailand-map { height: 100%; width: auto; max-width: 100%; }
  .land { fill: var(--sand); stroke: #cdbea5; stroke-width: 1.2; }
  .pin circle { fill: var(--bg); stroke: var(--muted); stroke-width: 2; transition: fill 0.35s, stroke 0.35s, transform 0.35s; transform-box: fill-box; transform-origin: center; }
  .pin text { font: 600 11px var(--sans); fill: var(--muted); transition: fill 0.35s; }
  .pin.is-active circle { fill: var(--red); stroke: var(--red); transform: scale(1.35); }
  .pin.is-active text { fill: var(--ink); }
</style>
```

`src/components/PlaceCard.astro`:

```astro
---
import { Picture } from 'astro:assets';
import { t } from '../i18n';
import type { Lang } from '../i18n/types';
import type { Localized } from '../lib/content';
import { pathFor } from '../lib/urls';

interface Props {
  lang: Lang;
  place: Localized<'places'>;
  tipCount: number;
  featured: Localized<'tips'>[];
}

const { lang, place, tipCount, featured } = Astro.props;
const d = t(lang);
const placeUrl = pathFor(lang, `destinations/${place.slug}/`);
const photo = featured.flatMap((tip) => tip.entry.data.photos)[0];
---
<article class:list={['place-card', { 'has-photo': photo }]} data-active-id={place.slug}>
  <div>
    <h3>{place.entry.data.name}</h3>
    <p>{place.entry.data.summary}</p>
    {featured.length > 0 && (
      <ul class="rec">
        {featured.map((tip) => (
          <li><a href={`${placeUrl}#tip-${tip.slug}`}>{tip.entry.data.title}</a><span>{d.category[tip.entry.data.category]}</span></li>
        ))}
      </ul>
    )}
    {tipCount > 0 && <a class="go" href={placeUrl}>{d.place.allTips(tipCount)}</a>}
  </div>
  {photo && (
    <div class="pic">
      <Picture src={photo.src} alt={photo.alt} formats={['avif', 'webp']} widths={[400, 700, 1000]} sizes="(max-width: 900px) 90vw, 25vw" />
    </div>
  )}
</article>

<style>
  .place-card { background: var(--card); border-radius: var(--radius); padding: clamp(20px, 2.2vw, 40px); margin-bottom: 16px; display: grid; gap: 18px; transition: box-shadow 0.35s; }
  .place-card.has-photo { grid-template-columns: 1.1fr 1fr; }
  h3 { font-family: var(--serif); font-weight: 400; font-size: clamp(32px, 3.2vw, 60px); line-height: 1; margin: 6px 0 12px; letter-spacing: -0.01em; }
  p { font-size: clamp(14px, 1.05vw, 17px); margin: 0 0 16px; }
  .rec { list-style: none; padding: 0; margin: 0 0 18px; border-top: 1px solid var(--line); }
  .rec li { display: flex; justify-content: space-between; gap: 10px; padding: 10px 0; border-bottom: 1px solid var(--line); font-size: clamp(14px, 1vw, 16px); }
  .rec a { text-decoration: none; }
  .rec a:hover { text-decoration: underline; }
  .rec span { color: var(--muted); font-size: 0.85em; white-space: nowrap; }
  .go { font-weight: 600; color: var(--red); text-decoration: none; font-size: clamp(14px, 1vw, 16px); }
  .pic :global(img) { display: block; width: 100%; height: 100%; aspect-ratio: 4 / 5; object-fit: cover; border-radius: 12px; }
  @media (max-width: 900px) {
    .place-card.has-photo { grid-template-columns: 1fr; }
    .pic :global(img) { aspect-ratio: 16 / 10; }
  }
</style>
```

`src/components/WhereToGo.astro`:

```astro
---
import { t } from '../i18n';
import { REGIONS, type Lang } from '../i18n/types';
import { getPlaceOverview } from '../lib/content';
import PlaceCard from './PlaceCard.astro';
import ThailandMap from './ThailandMap.astro';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const d = t(lang);
const overview = await getPlaceOverview(lang);
const groups = REGIONS.map((region) => ({ region, items: overview.filter((o) => o.place.entry.data.region === region) })).filter((g) => g.items.length > 0);
const mapPlaces = overview.map(({ place }) => ({
  slug: place.slug,
  name: place.entry.data.name,
  coords: place.entry.data.coords,
  labelSide: place.entry.data.mapLabelSide,
}));
---
<div class="where" data-where>
  <div class="map"><ThailandMap places={mapPlaces} label={d.destinations.mapLabel} /></div>
  <div>
    {groups.map((group) => (
      <section class="group">
        <p class="label">{d.regions[group.region]}</p>
        {group.items.map((item) => <PlaceCard lang={lang} place={item.place} tipCount={item.tipCount} featured={item.featured} />)}
      </section>
    ))}
  </div>
</div>

<script>
  import { watchActive } from '../scripts/scroll-active';
  document.querySelectorAll<HTMLElement>('[data-where]').forEach((root) => {
    const cards = [...root.querySelectorAll<HTMLElement>('.place-card[data-active-id]')];
    const pins = [...root.querySelectorAll<SVGGElement>('[data-pin-id]')];
    watchActive(cards, (id) => {
      for (const pin of pins) pin.classList.toggle('is-active', pin.dataset.pinId === id);
    });
  });
</script>

<style>
  .where { display: grid; grid-template-columns: minmax(260px, 2fr) 3fr; gap: clamp(20px, 4vw, 70px); padding-bottom: clamp(40px, 6vw, 110px); }
  .map { position: sticky; top: 24px; align-self: start; height: min(82vh, 860px); display: flex; align-items: center; justify-content: center; }
  .group { margin-bottom: clamp(20px, 2.4vw, 40px); }
  .group > .label { color: var(--muted); margin: 0 0 12px; }
  @media (max-width: 900px) {
    .where { grid-template-columns: 1fr; }
    .map { position: relative; top: 0; height: 380px; }
  }
</style>
```

`src/components/SkipBlock.astro`:

```astro
---
import { render } from 'astro:content';
import { t } from '../i18n';
import type { Lang } from '../i18n/types';
import { getSkips, getTip } from '../lib/content';
import { pathFor } from '../lib/urls';

interface Props {
  lang: Lang;
}

const { lang } = Astro.props;
const d = t(lang);
const skips = await Promise.all(
  (await getSkips(lang)).map(async (skip) => {
    const { Content } = await render(skip.entry);
    const tip = skip.entry.data.insteadTip ? await getTip(lang, skip.entry.data.insteadTip) : undefined;
    const instead = tip
      ? { name: tip.entry.data.title, href: `${pathFor(lang, `destinations/${tip.entry.data.place}/`)}#tip-${tip.slug}` }
      : undefined;
    return { slug: skip.slug, title: skip.entry.data.title, Content, instead };
  }),
);
---
{skips.length > 0 && (
  <section class="skip-block">
    <div class="wrap inner">
      <div>
        <p class="label">{d.skip.label}</p>
        <h2>{d.skip.titleStart}{' '}<i>{d.skip.titleAccent}</i></h2>
      </div>
      <div class="cards">
        {skips.map(({ slug, title, Content, instead }) => (
          <article class="skip-card" id={`skip-${slug}`}>
            <h3>{title}</h3>
            <div class="text"><Content /></div>
            {instead && <a class="instead" href={instead.href}>{d.skip.instead(instead.name)}</a>}
          </article>
        ))}
      </div>
    </div>
  </section>
)}

<style>
  .skip-block { background: var(--ink); color: var(--bg); }
  .inner { display: grid; grid-template-columns: 1fr 1.2fr; gap: clamp(20px, 4vw, 80px); align-items: center; padding-top: clamp(40px, 6vw, 110px); padding-bottom: clamp(40px, 6vw, 110px); }
  .label { color: var(--skip); margin: 0; }
  h2 { font-family: var(--serif); font-weight: 300; font-size: clamp(36px, 4.6vw, 88px); line-height: 1; margin: 12px 0 0; }
  h2 i { color: var(--skip); }
  .cards { display: grid; gap: 16px; }
  .skip-card { background: rgb(242 235 221 / 0.07); border-radius: var(--radius); padding: clamp(20px, 2.2vw, 40px); }
  h3 { font-family: var(--serif); font-weight: 400; font-size: clamp(24px, 2.2vw, 40px); margin: 0 0 10px; text-decoration: line-through; text-decoration-color: var(--skip); text-decoration-thickness: 2px; }
  .text { font-size: clamp(14px, 1.05vw, 17px); opacity: 0.92; }
  .text :global(p) { margin: 0 0 12px; }
  .instead { color: var(--skip); font-weight: 600; text-decoration: none; }
  @media (max-width: 900px) { .inner { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 6: Destinations-Seite schreiben**

`src/pages/[lang]/destinations/index.astro`:

```astro
---
import SkipBlock from '../../../components/SkipBlock.astro';
import WhereToGo from '../../../components/WhereToGo.astro';
import { t } from '../../../i18n';
import BaseLayout from '../../../layouts/BaseLayout.astro';
import { isLang, langPaths } from '../../../lib/urls';

export function getStaticPaths() {
  return langPaths();
}

const { lang } = Astro.params;
if (!isLang(lang)) throw new Error(`Unknown language ${lang}`);
const d = t(lang);
---
<BaseLayout lang={lang} path="destinations/" title={d.destinations.label} description={d.destinations.lead} current="destinations">
  <section class="wrap page-head">
    <p class="label">{d.destinations.label}</p>
    <h1 class="page-title">{d.destinations.title}</h1>
    <p class="lead">{d.destinations.lead}</p>
  </section>
  <section class="wrap"><WhereToGo lang={lang} /></section>
  <SkipBlock lang={lang} />
</BaseLayout>
```

- [ ] **Step 7: Prüfen, bauen, E2E laufen lassen**

Run: `npm run check && npm test && npm run build && npx playwright test tests/e2e/destinations.spec.ts`
Expected: alles grün.

- [ ] **Step 8: Sichtprüfung**

`/en/destinations/` bei 1920 px: exakter Thailand-Umriss mit Inseln, Kanchanaburi-Beschriftung links vom Punkt, Karte bleibt beim Scrollen stehen. Bei 390 px steht die Karte über den Orten.

- [ ] **Step 9: Commit**

```bash
git add -A
git commit -m "feat: Thailand-Übersichtskarte, Ortskarten und Destinations-Seite

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 7: Startseite und "All over Thailand"

**Files:**
- Create: `src/data/home.ts`, `src/components/EverywhereTiles.astro`, `src/pages/[lang]/all-over-thailand.astro`
- Modify: `src/pages/[lang]/index.astro` (vorläufige Startseite komplett ersetzen)
- Test: `tests/e2e/home.spec.ts`, `tests/e2e/responsive.spec.ts`

**Interfaces:**
- Consumes: `ArchPhoto`, `FilterBar`, `countOptions` (Task 4); `WhereToGo`, `SkipBlock` (Task 6); `getThailandTips` (Task 2).
- Produces: `heroPhotos: { src: ImageMetadata; alt: Record<Lang, string>; position: string }[]` aus `src/data/home.ts`; Komponente `EverywhereTiles { lang: Lang; tips: Localized<'tips'>[] }` (rendert `<div class="everywhere" data-filter-root>` mit Kacheln `.tile`); Liste `PAGES` in `tests/e2e/responsive.spec.ts`, die Task 8 und 9 erweitern.

- [ ] **Step 1: Failing E2E-Tests schreiben**

`tests/e2e/home.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('the home page shows hero, destinations, recommendations and skips', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Thailand Vibes');
  const arches = page.locator('.hero .arch img');
  await expect(arches).toHaveCount(3);
  for (const img of await arches.all()) {
    await expect.poll(() => img.evaluate((el) => (el as HTMLImageElement).naturalWidth)).toBeGreaterThan(0);
  }
  await expect(page.locator('.place-card')).toHaveCount(5);
  await expect(page.locator('.everywhere .tile')).toHaveCount(7);
  await expect(page.locator('.skip-block')).toBeVisible();
});

test('the recommendations on the home page can be filtered', async ({ page }) => {
  await page.goto('/en/');
  await page.locator('.everywhere').getByRole('button', { name: /^Temples/ }).click();
  await expect(page.locator('.everywhere .tile').filter({ visible: true })).toHaveCount(1);
});

test('the home page links to all tips for all over Thailand', async ({ page }) => {
  await page.goto('/en/');
  await expect(page.getByRole('link', { name: 'All tips for all over Thailand →' })).toHaveAttribute('href', '/en/all-over-thailand/');
});

test('All over Thailand lists every general tip and filters them', async ({ page }) => {
  await page.goto('/en/all-over-thailand/');
  await expect(page.locator('.everywhere .tile')).toHaveCount(14);
  await page.getByRole('button', { name: /^Drinks/ }).click();
  await expect(page.locator('.everywhere .tile').filter({ visible: true })).toHaveCount(2);
});

test('the German home page is German', async ({ page }) => {
  await page.goto('/de/');
  await expect(page.getByRole('heading', { level: 2, name: 'Wohin die Reise geht' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Alle Tipps für ganz Thailand →' })).toHaveAttribute('href', '/de/all-over-thailand/');
});
```

`tests/e2e/responsive.spec.ts`:

```ts
import { expect, test } from '@playwright/test';
import { expectNoHorizontalScroll } from './helpers';

const PAGES = [
  '/en/', '/de/',
  '/en/destinations/', '/de/destinations/',
  '/en/destinations/bangkok/', '/de/destinations/bangkok/',
  '/en/all-over-thailand/', '/de/all-over-thailand/',
];

for (const path of PAGES) {
  test(`${path} never scrolls sideways`, async ({ page }) => {
    await page.goto(path);
    await expectNoHorizontalScroll(page);
  });

  test(`${path} gives every image a text alternative`, async ({ page }) => {
    await page.goto(path);
    expect(await page.locator('img:not([alt])').count()).toBe(0);
  });
}
```

- [ ] **Step 2: Fotos der Startseite festlegen**

`src/data/home.ts` (wenn Foto 32 in Task 3 nicht freigegeben wurde: `bang-kachao-coconut-lane.jpg` mit den Alt-Texten aus Task 3 und `position: '50% 50%'` statt `bang-kachao-bike.jpg` importieren):

```ts
import type { ImageMetadata } from 'astro';
import type { Lang } from '../i18n/types';
import bangKachao from '../assets/photos/bangkok/bang-kachao-bike.jpg';
import tuktuk from '../assets/photos/bangkok/tuktuk-night.jpg';
import watPaknam from '../assets/photos/bangkok/wat-paknam-buddha.jpg';

export interface HeroPhoto {
  src: ImageMetadata;
  alt: Record<Lang, string>;
  position: string;
}

export const heroPhotos: HeroPhoto[] = [
  { src: tuktuk, position: '45% 55%', alt: { en: 'A TukTuk with green lights at night', de: 'Ein TukTuk mit grüner Beleuchtung bei Nacht' } },
  { src: watPaknam, position: '55% 50%', alt: { en: 'The giant golden Buddha next to the white stupa of Wat Paknam', de: 'Der riesige goldene Buddha neben der weißen Stupa von Wat Paknam' } },
  { src: bangKachao, position: '50% 40%', alt: { en: 'Biking along a narrow path through the jungle on Bang Kachao', de: 'Mit dem Fahrrad auf einem schmalen Weg durch den Dschungel von Bang Kachao' } },
];
```

- [ ] **Step 3: Kachel-Komponente schreiben**

`src/components/EverywhereTiles.astro`:

```astro
---
import { Picture } from 'astro:assets';
import { render } from 'astro:content';
import { t } from '../i18n';
import { CATEGORIES, type Lang } from '../i18n/types';
import { countOptions } from '../lib/categories';
import type { Localized } from '../lib/content';
import FilterBar from './FilterBar.astro';

interface Props {
  lang: Lang;
  tips: Localized<'tips'>[];
}

const { lang, tips } = Astro.props;
const d = t(lang);
const options = countOptions(tips.map((tip) => tip.entry.data.category), CATEGORIES, (c) => d.categories[c]);
const tiles = await Promise.all(tips.map(async (tip) => ({ tip, Content: (await render(tip.entry)).Content })));
---
<div class="everywhere" data-filter-root>
  <FilterBar lang={lang} options={options} total={tips.length} />
  <div class="bento" data-filter-list>
    {tiles.map(({ tip, Content }) => {
      const data = tip.entry.data;
      const photo = data.photos[0];
      const tone = data.tile?.tone ?? 'card';
      const size = data.tile?.size ?? 'normal';
      return (
        <article class:list={['tile', `tone-${tone}`, `size-${size}`, { 'has-photo': photo }]} id={`tip-${tip.slug}`} data-filter-item data-category={data.category}>
          {photo && (
            <Picture
              src={photo.src}
              alt={photo.alt}
              formats={['avif', 'webp']}
              widths={[400, 700, 1000]}
              sizes="(max-width: 900px) 50vw, 33vw"
              style={photo.position ? `object-position: ${photo.position}` : undefined}
            />
          )}
          <div class="tile-body">
            <p class="label">{d.category[data.category]}</p>
            <h3>{data.title}</h3>
            <div class="tile-text"><Content /></div>
            {photo?.credit && <p class="credit">{`${d.photo.label}: ${photo.credit.author}, ${photo.credit.license}`}</p>}
          </div>
        </article>
      );
    })}
  </div>
</div>

<style>
  .bento { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); grid-auto-rows: minmax(clamp(160px, 14vw, 260px), auto); grid-auto-flow: dense; gap: clamp(10px, 1.2vw, 20px); }
  .tile { border-radius: var(--radius); padding: clamp(18px, 1.8vw, 32px); display: flex; flex-direction: column; justify-content: flex-end; position: relative; overflow: hidden; background: var(--card); }
  .size-tall { grid-row: span 2; }
  .size-wide { grid-column: span 2; }
  .tone-red { background: var(--red); color: var(--bg); }
  .tone-red .label { color: var(--bg); }
  .tone-ink { background: var(--ink); color: var(--bg); }
  .tone-ink .label { color: var(--skip); }
  .tone-sand { background: var(--sand); }
  .has-photo { color: #fff; padding: 0; }
  .has-photo :global(picture) { position: absolute; inset: 0; }
  .has-photo :global(img) { width: 100%; height: 100%; object-fit: cover; }
  .has-photo .tile-body { position: relative; padding: clamp(18px, 1.8vw, 32px); background: linear-gradient(180deg, transparent, rgb(0 0 0 / 0.55) 35%, rgb(0 0 0 / 0.78)); }
  .has-photo .label { color: #f6c9b8; }
  .label { margin: 0; }
  h3 { font-family: var(--serif); font-weight: 400; font-size: clamp(22px, 2vw, 38px); line-height: 1.05; margin: 8px 0; }
  .tile-text { font-size: clamp(13px, 0.95vw, 16px); line-height: 1.55; }
  .tile-text :global(p) { margin: 0; }
  .credit { font-size: 11px; margin: 8px 0 0; opacity: 0.85; }
  @media (max-width: 900px) {
    .bento { grid-template-columns: repeat(2, minmax(0, 1fr)); }
    .tile, .has-photo .tile-body { padding: 16px; }
    .has-photo { padding: 0; }
    h3 { font-size: 20px; }
  }
</style>
```

- [ ] **Step 4: Startseite schreiben**

`src/pages/[lang]/index.astro` (ersetzt die vorläufige Fassung komplett):

```astro
---
import ArchPhoto from '../../components/ArchPhoto.astro';
import EverywhereTiles from '../../components/EverywhereTiles.astro';
import SkipBlock from '../../components/SkipBlock.astro';
import WhereToGo from '../../components/WhereToGo.astro';
import { heroPhotos } from '../../data/home';
import { t } from '../../i18n';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getThailandTips } from '../../lib/content';
import { isLang, langPaths, pathFor } from '../../lib/urls';

export function getStaticPaths() {
  return langPaths();
}

const { lang } = Astro.params;
if (!isLang(lang)) throw new Error(`Unknown language ${lang}`);
const d = t(lang);
const featured = await getThailandTips(lang, true);
---
<BaseLayout lang={lang} path="">
  <section class="hero wrap">
    <p class="label">{d.home.kicker}</p>
    <h1 class="title">{d.home.titleMain}{' '}<i>{d.home.titleAccent}</i></h1>
    <div class="arches">
      {heroPhotos.map((photo, index) => (
        <ArchPhoto
          src={photo.src}
          alt={photo.alt[lang]}
          position={photo.position}
          ratio={index === 1 ? '3 / 4' : '4 / 5'}
          eager
          sizes="(max-width: 900px) 33vw, 30vw"
        />
      ))}
    </div>
  </section>

  <section class="intro wrap">
    <div>
      <p class="label">{d.home.welcomeLabel}</p>
      <h2>{d.home.welcomeTitle}</h2>
    </div>
    <p>{d.home.welcomeText}</p>
  </section>

  <section class="wrap" aria-labelledby="where-title">
    <div class="sec-head">
      <div><p class="label">{d.home.destinationsLabel}</p><h2 id="where-title">{d.home.destinationsTitle}</h2></div>
      <p>{d.home.destinationsLead}</p>
    </div>
    <WhereToGo lang={lang} />
  </section>

  <section class="wrap everywhere-section" aria-labelledby="every-title">
    <div class="sec-head">
      <div><p class="label">{d.home.everywhereLabel}</p><h2 id="every-title">{d.home.everywhereTitle}</h2></div>
      <p>{d.home.everywhereLead}</p>
    </div>
    <EverywhereTiles lang={lang} tips={featured} />
    <p class="more"><a href={pathFor(lang, 'all-over-thailand/')}>{d.home.everywhereMore}</a></p>
  </section>

  <SkipBlock lang={lang} />
</BaseLayout>

<style>
  .hero { text-align: center; padding-top: clamp(10px, 2vw, 40px); }
  .hero .label { margin: 0; }
  .title { font-family: var(--serif); font-weight: 300; font-size: clamp(64px, 13vw, 250px); line-height: 0.86; letter-spacing: -0.035em; margin: 0.12em 0 0; position: relative; z-index: 1; }
  .title i { color: var(--red); }
  .arches { display: grid; grid-template-columns: 1fr 1.2fr 1fr; gap: clamp(10px, 1.6vw, 28px); align-items: end; margin-top: clamp(-90px, -4vw, -20px); position: relative; z-index: 0; }
  .intro { display: grid; grid-template-columns: 1.3fr 1fr; gap: clamp(20px, 4vw, 80px); align-items: end; padding-top: clamp(40px, 6vw, 110px); padding-bottom: clamp(40px, 6vw, 110px); }
  .intro .label { margin: 0; }
  .intro h2 { font-family: var(--serif); font-weight: 300; font-size: clamp(30px, 3.4vw, 64px); line-height: 1.05; margin: 14px 0 0; }
  .intro > p { font-size: clamp(15px, 1.15vw, 19px); margin: 0; }
  .everywhere-section { padding-bottom: clamp(40px, 6vw, 110px); }
  .more { margin: clamp(18px, 2vw, 30px) 0 0; }
  .more a { font-weight: 600; color: var(--red); text-decoration: none; }
  @media (max-width: 900px) {
    .arches { margin-top: -6px; }
    .intro { grid-template-columns: 1fr; }
  }
</style>
```

- [ ] **Step 5: Seite "All over Thailand" schreiben**

`src/pages/[lang]/all-over-thailand.astro`:

```astro
---
import EverywhereTiles from '../../components/EverywhereTiles.astro';
import { t } from '../../i18n';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getThailandTips } from '../../lib/content';
import { isLang, langPaths } from '../../lib/urls';

export function getStaticPaths() {
  return langPaths();
}

const { lang } = Astro.params;
if (!isLang(lang)) throw new Error(`Unknown language ${lang}`);
const d = t(lang);
const tips = await getThailandTips(lang);
---
<BaseLayout lang={lang} path="all-over-thailand/" title={d.everywhere.label} description={d.everywhere.lead} current="all-over-thailand">
  <section class="wrap page-head">
    <p class="label">{d.everywhere.label}</p>
    <h1 class="page-title">{d.everywhere.title}</h1>
    <p class="lead">{d.everywhere.lead}</p>
  </section>
  <section class="wrap"><EverywhereTiles lang={lang} tips={tips} /></section>
</BaseLayout>
```

- [ ] **Step 6: Prüfen, bauen, alle E2E-Tests laufen lassen**

Run: `npm run verify`
Expected: alles grün, inklusive `responsive.spec.ts` für 8 Seiten in beiden Projekten.

- [ ] **Step 7: Sichtprüfung gegen den Entwurf**

`/en/` und `/de/` bei 1920, 1280 und 390 px neben `docs/superpowers/mockups/startseite.html` und `docs/superpowers/mockups/handy/1-startseite-oben.jpg` legen: Titel wächst mit der Breite, die drei Bögen ragen leicht in den Titel, Kacheln wie im Entwurf (große Foto-Kachel links, rote Mango-Kachel, dunkle Massage-Kachel, breite Markt-Kachel).

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: Startseite und Seite für Tipps in ganz Thailand

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 8: Essen und Trinken in Bangkok

**Files:**
- Create: `src/components/RestaurantCard.astro`, `src/pages/[lang]/destinations/[place]/food.astro`
- Modify: `tests/e2e/responsive.spec.ts` (Seiten ergänzen), ggf. `src/content/restaurants/{en,de}/*.md` (Koordinaten)
- Test: `tests/e2e/food.spec.ts`

**Interfaces:**
- Consumes: `getPlaces`, `getRestaurants` (Task 2); `FilterBar`, `countOptions`, `watchActive` (Task 4); `PlaceMap`, `MapPin` (Task 5); `parseMapsUrl` und `scripts/resolve-maps-link.ts` (Task 2).
- Produces: Seite `/<lang>/destinations/<place>/food/` für jeden Ort mit Restaurants; `RestaurantCard { lang: Lang; restaurant: Localized<'restaurants'>; index: number }` (rendert `<article id="restaurant-<slug>" data-filter-item data-category="<cuisine>" data-active-id="restaurant-<slug>">`).

- [ ] **Step 1: Fehlende Restaurant-Orte bei der Autorin erfragen**

Die Autorin um Google-Maps-Links bitten für: The Local, Shamballa Somtam, Baan Suan Sathon, Supanniga Eating Room Tha Tian. Für jeden gelieferten Link:

```bash
node scripts/resolve-maps-link.ts <link>
```

Die ausgegebenen Koordinaten als `coords` und den Link als `mapsUrl` in `src/content/restaurants/en/<slug>.md` und `src/content/restaurants/de/<slug>.md` eintragen. Kommen keine Links, bleiben diese vier ohne Pin (das ist erlaubt).

- [ ] **Step 2: Failing E2E-Tests schreiben**

`tests/e2e/food.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('the Bangkok food page lists all restaurants', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/food/');
  await expect(page.getByRole('heading', { level: 1, name: 'Food & drinks in Bangkok' })).toBeVisible();
  await expect(page.locator('.restaurant')).toHaveCount(8);
  await expect(page.getByRole('button', { name: /^Thai food/ })).toBeVisible();
});

test('the street food tip leads to the food page', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/');
  await page.getByRole('link', { name: 'My favorite restaurants in Bangkok →' }).click();
  await expect(page).toHaveURL(/\/en\/destinations\/bangkok\/food\/$/);
});

test('restaurants with a known location get a pin', async ({ page }) => {
  await page.goto('/en/destinations/bangkok/food/');
  await page.locator('[data-place-map]').scrollIntoViewIfNeeded();
  const withCoords = await page.locator('.restaurant[data-has-pin="true"]').count();
  expect(withCoords).toBeGreaterThanOrEqual(4);
  await expect(page.locator('[data-place-map] .tv-pin')).toHaveCount(withCoords);
});

test('the German food page is German', async ({ page }) => {
  await page.goto('/de/destinations/bangkok/food/');
  await expect(page.getByRole('heading', { level: 1, name: 'Essen & Trinken in Bangkok' })).toBeVisible();
  await expect(page.getByRole('button', { name: /^Thailändisch/ })).toBeVisible();
});
```

In `tests/e2e/responsive.spec.ts` die Liste `PAGES` um `'/en/destinations/bangkok/food/', '/de/destinations/bangkok/food/'` ergänzen.

- [ ] **Step 3: Restaurant-Karte schreiben**

`src/components/RestaurantCard.astro`:

```astro
---
import { render } from 'astro:content';
import { t } from '../i18n';
import type { Lang } from '../i18n/types';
import type { Localized } from '../lib/content';

interface Props {
  lang: Lang;
  restaurant: Localized<'restaurants'>;
  index: number;
}

const { lang, restaurant, index } = Astro.props;
const d = t(lang);
const data = restaurant.entry.data;
const { Content } = await render(restaurant.entry);
const id = `restaurant-${restaurant.slug}`;
---
<article class="restaurant" id={id} data-filter-item data-category={data.cuisine} data-active-id={id} data-has-pin={String(Boolean(data.coords))}>
  <div class="num" aria-hidden="true">{String(index).padStart(2, '0')}</div>
  <div>
    <p class="label">{d.cuisines[data.cuisine]}</p>
    <h3>{data.name}</h3>
    <div class="text"><Content /></div>
    <dl class="facts"><dt>{d.food.price}</dt><dd>{data.price}</dd></dl>
    <a class="btn" href={data.mapsUrl} target="_blank" rel="noopener">{d.place.openInMaps}</a>
  </div>
</article>

<style>
  .restaurant { background: var(--card); border-radius: var(--radius); padding: clamp(20px, 2.2vw, 40px); margin-bottom: 18px; display: grid; grid-template-columns: auto minmax(0, 1fr); gap: clamp(14px, 1.6vw, 28px); transition: box-shadow 0.3s; scroll-margin-top: 90px; }
  .num { font-family: var(--serif); font-weight: 300; font-size: clamp(40px, 3.4vw, 64px); line-height: 0.9; color: var(--red); }
  .label { margin: 0; }
  h3 { font-family: var(--serif); font-weight: 400; font-size: clamp(24px, 2.1vw, 40px); line-height: 1.05; margin: 8px 0 12px; }
  .text { font-size: clamp(14px, 1.02vw, 17px); line-height: 1.65; }
  .text :global(p) { margin: 0 0 14px; }
  .facts { display: grid; grid-template-columns: auto 1fr; gap: 6px 16px; font-size: clamp(13px, 0.95vw, 15px); margin: 0 0 18px; }
  .facts dt { color: var(--muted); }
  .facts dd { margin: 0; }
  @media (max-width: 900px) { .restaurant { grid-template-columns: 1fr; } }
</style>
```

- [ ] **Step 4: Essen-Seite schreiben**

`src/pages/[lang]/destinations/[place]/food.astro`:

```astro
---
import type { InferGetStaticPropsType } from 'astro';
import FilterBar from '../../../../components/FilterBar.astro';
import PlaceMap from '../../../../components/PlaceMap.astro';
import RestaurantCard from '../../../../components/RestaurantCard.astro';
import { t } from '../../../../i18n';
import { CUISINES, LANGS } from '../../../../i18n/types';
import BaseLayout from '../../../../layouts/BaseLayout.astro';
import { countOptions } from '../../../../lib/categories';
import { getPlaces, getRestaurants } from '../../../../lib/content';
import type { MapPin } from '../../../../lib/map-helpers';
import { pathFor } from '../../../../lib/urls';

export async function getStaticPaths() {
  const paths = [];
  for (const lang of LANGS) {
    for (const place of await getPlaces(lang)) {
      const restaurants = await getRestaurants(lang, place.slug);
      if (restaurants.length > 0) paths.push({ params: { lang, place: place.slug }, props: { lang, place, restaurants } });
    }
  }
  return paths;
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { lang, place, restaurants } = Astro.props as Props;
const d = t(lang);
const name = place.entry.data.name;
const options = countOptions(restaurants.map((r) => r.entry.data.cuisine), CUISINES, (c) => d.cuisines[c]);
const pins: MapPin[] = restaurants.flatMap((r, index) =>
  r.entry.data.coords
    ? [{
        id: `restaurant-${r.slug}`,
        label: String(index + 1),
        title: r.entry.data.name,
        category: r.entry.data.cuisine,
        coords: r.entry.data.coords,
        anchor: `restaurant-${r.slug}`,
      }]
    : [],
);
---
<BaseLayout lang={lang} path={`destinations/${place.slug}/food/`} title={d.food.title(name)} description={d.food.lead(name)} current="destinations">
  <section class="wrap page-head">
    <p class="crumb"><a href={pathFor(lang, 'destinations/')}>{d.place.breadcrumb}</a>{' / '}<a href={pathFor(lang, `destinations/${place.slug}/`)}>{name}</a></p>
    <p class="label">{d.food.label}</p>
    <h1 class="page-title">{d.food.title(name)}</h1>
    <p class="lead">{d.food.lead(name)}</p>
  </section>

  <div data-filter-root>
    <div class="bar"><div class="wrap"><FilterBar lang={lang} options={options} total={restaurants.length} /></div></div>
    <div class="wrap body">
      <div class="list" id="restaurants" data-filter-list>
        {restaurants.map((restaurant, index) => <RestaurantCard lang={lang} restaurant={restaurant} index={index + 1} />)}
      </div>
      {pins.length > 0 && (
        <aside class="map-col">
          <div class="map-wrap"><PlaceMap lang={lang} pins={pins} label={d.food.mapLabel} /></div>
        </aside>
      )}
    </div>
  </div>
</BaseLayout>

<script>
  import { watchActive } from '../../../../scripts/scroll-active';
  watchActive([...document.querySelectorAll<HTMLElement>('#restaurants [data-active-id]')], (id) => {
    document.dispatchEvent(new CustomEvent('tv:active', { detail: { id } }));
  });
</script>

<style>
  .crumb { font-size: clamp(13px, 0.9vw, 15px); color: var(--muted); margin: 0 0 14px; }
  .crumb a { text-decoration: none; }
  .bar { position: sticky; top: 0; z-index: 500; background: color-mix(in srgb, var(--bg) 92%, transparent); backdrop-filter: blur(8px); border-top: 1px solid var(--line); border-bottom: 1px solid var(--line); }
  .body { display: grid; grid-template-columns: minmax(0, 1.5fr) minmax(0, 1fr); gap: clamp(20px, 3vw, 56px); padding-top: clamp(24px, 3vw, 50px); }
  .list { scroll-margin-top: 90px; }
  .map-wrap { position: sticky; top: 76px; height: calc(100vh - 100px); max-height: 860px; }
  @media (max-width: 900px) {
    .body { grid-template-columns: 1fr; }
    .map-col { order: -1; }
    .map-wrap { position: relative; top: 0; height: 340px; }
  }
</style>
```

- [ ] **Step 5: Prüfen, bauen, E2E laufen lassen**

Run: `npm run verify`
Expected: alles grün.

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: Seite Essen und Trinken mit Restaurants, Filter und Karte

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 9: Textseiten, Impressum und Datenschutz

**Files:**
- Modify: `src/content.config.ts` (Collection `pages`), `src/lib/content.ts` (Prüfung und Getter), `src/components/Header.astro` (Menüpunkte nur bei vorhandenem Text), `tests/unit/content-files.test.ts` (nichts zu ändern, liest `pages` automatisch)
- Create: `src/content/pages/de/impressum.md`, `src/content/pages/de/datenschutz.md`, `src/pages/[lang]/[page].astro`
- Modify: `tests/e2e/responsive.spec.ts` (Seiten ergänzen)
- Test: `tests/e2e/text-pages.spec.ts`

**Interfaces:**
- Consumes: `CheckItem.onlyLang` und `findContentProblems` (Task 2), `BaseLayout.onlyLangs` (Task 1).
- Produces: `getPages(lang: Lang): Promise<Localized<'pages'>[]>`, `getPage(lang: Lang, slug: string)`; Seiten `/<lang>/<slug>/` für jeden Text in `src/content/pages/<lang>/`. Neue Texte für "Before you come" (`before-you-come.md`) und "About" (`about.md`) erscheinen ab dann automatisch im Menü.

- [ ] **Step 1: Failing E2E-Tests schreiben**

`tests/e2e/text-pages.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('imprint and privacy are linked from both languages', async ({ page }) => {
  for (const lang of ['en', 'de']) {
    await page.goto(`/${lang}/`);
    const footer = page.getByRole('contentinfo');
    await expect(footer.getByRole('link', { name: 'Impressum' })).toHaveAttribute('href', '/de/impressum/');
    await expect(footer.getByRole('link', { name: 'Datenschutz' })).toHaveAttribute('href', '/de/datenschutz/');
  }
});

test('the imprint exists only in German and the language switch never leads to a 404', async ({ page, request }) => {
  await page.goto('/de/impressum/');
  await expect(page.getByRole('heading', { level: 1, name: 'Impressum' })).toBeVisible();
  await page.getByRole('banner').getByRole('link', { name: 'English' }).click();
  await expect(page).toHaveURL(/\/en\/$/);
  expect((await request.get('/en/impressum/')).status()).toBe(404);
});

test('the privacy page names the map provider', async ({ page }) => {
  await page.goto('/de/datenschutz/');
  await expect(page.getByRole('heading', { level: 1, name: 'Datenschutzerklärung' })).toBeVisible();
  await expect(page.getByText('OpenFreeMap', { exact: false }).first()).toBeVisible();
});

test('pages without text are not in the menu yet', async ({ page }) => {
  await page.goto('/en/');
  const nav = page.getByRole('navigation', { name: 'Main' });
  await expect(nav.getByRole('link', { name: 'Before you come' })).toHaveCount(0);
  await expect(nav.getByRole('link', { name: 'About' })).toHaveCount(0);
});
```

In `tests/e2e/responsive.spec.ts` die Liste `PAGES` um `'/de/impressum/', '/de/datenschutz/'` ergänzen.

- [ ] **Step 2: Collection `pages` und Getter ergänzen**

In `src/content.config.ts` vor `export const collections` einfügen und die Zeile ersetzen:

```ts
const pages = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/pages' }),
  schema: z.object({
    title: z.string(),
    description: z.string().optional(),
    label: z.string().optional(),
    facts: z.array(fact).default([]),
    onlyLang: z.enum(LANGS).optional(),
  }),
});

export const collections = { places, tips, restaurants, skips, pages };
```

und den Import ergänzen: `import { CATEGORIES, CUISINES, LANGS, REGIONS } from './i18n/types';`

In `src/lib/content.ts`:

```ts
type Name = 'places' | 'tips' | 'restaurants' | 'skips' | 'pages';
```

```ts
const NAMES: Name[] = ['places', 'tips', 'restaurants', 'skips', 'pages'];
```

im `items.push({...})` von `ensureContentValid` ergänzen:

```ts
          onlyLang: typeof data.onlyLang === 'string' ? data.onlyLang : undefined,
```

und am Dateiende:

```ts
export async function getPages(lang: Lang): Promise<Localized<'pages'>[]> {
  return localized('pages', lang);
}

export async function getPage(lang: Lang, slug: string): Promise<Localized<'pages'> | undefined> {
  return (await getPages(lang)).find((page) => page.slug === slug);
}
```

`byOrder` funktioniert auch mit `pages` (ohne `order` gilt 0); `getPages` sortiert trotzdem nicht, die Reihenfolge der Textseiten spielt keine Rolle.

- [ ] **Step 3: Impressum und Datenschutz als Entwurf anlegen**

Die Felder in eckigen Großbuchstaben sind Platzhalter. Sie werden in Task 12 mit den Angaben der Autorin ersetzt; `check-dist --strict` (Task 10) verhindert, dass sie veröffentlicht werden.

`src/content/pages/de/impressum.md`:

```md
---
title: Impressum
onlyLang: de
---
## Angaben gemäß § 5 DDG

[VORNAME NACHNAME]\
[STRASSE HAUSNUMMER]\
[PLZ ORT]\
Deutschland

## Kontakt

E-Mail: [E-MAIL-ADRESSE]

## Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV

[VORNAME NACHNAME], Anschrift wie oben

## Links zu anderen Websites

Diese Seite verlinkt auf andere Websites, zum Beispiel auf Google Maps. Für deren Inhalte ist der jeweilige Anbieter verantwortlich.

## Bildnachweise

Fotos ohne Angabe sind meine eigenen. Fotos anderer Fotografinnen und Fotografen sind direkt am Bild mit Namen und Lizenz gekennzeichnet.
```

`src/content/pages/de/datenschutz.md`:

```md
---
title: Datenschutzerklärung
onlyLang: de
---
## Verantwortlich

[VORNAME NACHNAME], [STRASSE HAUSNUMMER], [PLZ ORT], E-Mail: [E-MAIL-ADRESSE]

## Das Wichtigste in Kürze

Diese Website setzt keine Cookies, nutzt keine Analyse- oder Trackingdienste und hat keine Formulare. Die Schriften werden von dieser Website selbst geladen, nicht von Google.

## Hosting

Die Website liegt bei Cloudflare, Inc., 101 Townsend St, San Francisco, CA 94107, USA. Beim Aufruf verarbeitet Cloudflare technisch notwendige Daten wie IP-Adresse, Datum und Uhrzeit, die aufgerufene Seite und Angaben zum Browser, um die Seite auszuliefern und vor Angriffen zu schützen. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, das berechtigte Interesse an einer sicheren und schnellen Website. Mit Cloudflare besteht ein Vertrag zur Auftragsverarbeitung, Cloudflare ist nach dem EU-US Data Privacy Framework zertifiziert.

## Karten

Auf den Seiten zu einzelnen Orten zeigt eine Karte von OpenFreeMap (https://openfreemap.org), wo die Tipps liegen. Dafür lädt dein Browser Kartendaten von den Servern von OpenFreeMap, die dabei deine IP-Adresse erhalten. Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO, das berechtigte Interesse, die Orte anschaulich zu zeigen. Die Kartendaten stammen von OpenStreetMap und OpenMapTiles.

## Links zu Google Maps

Die Buttons "In Google Maps öffnen" sind gewöhnliche Links. Erst wenn du darauf klickst, öffnet sich Google Maps, und dann gelten die Datenschutzbestimmungen von Google.

## Deine Rechte

Du hast das Recht auf Auskunft, Berichtigung, Löschung und Einschränkung der Verarbeitung deiner Daten und ein Widerspruchsrecht (Art. 15 bis 21 DSGVO). Außerdem kannst du dich bei einer Datenschutz-Aufsichtsbehörde beschweren (Art. 77 DSGVO).
```

- [ ] **Step 4: Seiten-Route schreiben**

`src/pages/[lang]/[page].astro`:

```astro
---
import type { InferGetStaticPropsType } from 'astro';
import { render } from 'astro:content';
import type { NavKey } from '../../i18n/types';
import { LANGS } from '../../i18n/types';
import BaseLayout from '../../layouts/BaseLayout.astro';
import { getPages } from '../../lib/content';

export async function getStaticPaths() {
  const paths = [];
  for (const lang of LANGS) {
    for (const page of await getPages(lang)) paths.push({ params: { lang, page: page.slug }, props: { lang, page } });
  }
  return paths;
}

type Props = InferGetStaticPropsType<typeof getStaticPaths>;
const { lang, page } = Astro.props as Props;
const data = page.entry.data;
const { Content } = await render(page.entry);
const navKeys: string[] = ['before-you-come', 'about'];
const current = navKeys.includes(page.slug) ? (page.slug as NavKey) : undefined;
---
<BaseLayout lang={lang} path={`${page.slug}/`} title={data.title} description={data.description} onlyLangs={data.onlyLang ? [data.onlyLang] : LANGS} current={current}>
  <section class="wrap page-head">
    {data.label && <p class="label">{data.label}</p>}
    <h1 class="page-title">{data.title}</h1>
  </section>
  {data.facts.length > 0 && (
    <section class="wrap">
      <dl class="facts">
        {data.facts.map((fact) => (
          <div><dt class="label">{fact.label}</dt><dd>{fact.value}</dd></div>
        ))}
      </dl>
    </section>
  )}
  <section class="wrap prose"><Content /></section>
</BaseLayout>

<style>
  .facts { display: grid; grid-template-columns: repeat(auto-fit, minmax(180px, 1fr)); gap: 12px; margin: 0 0 clamp(30px, 4vw, 60px); }
  .facts div { background: var(--card); border-radius: var(--radius); padding: 18px; }
  .facts dd { margin: 6px 0 0; font-family: var(--serif); font-size: clamp(18px, 1.4vw, 24px); }
  .prose { max-width: calc(72ch + 2 * var(--pad)); font-size: clamp(15px, 1.1vw, 18px); }
  .prose :global(h2) { font-family: var(--serif); font-weight: 400; font-size: clamp(22px, 1.8vw, 30px); margin: 1.6em 0 0.4em; }
  .prose :global(p) { margin: 0 0 1em; }
</style>
```

- [ ] **Step 5: Menüpunkte nur bei vorhandenem Text zeigen**

In `src/components/Header.astro` den Import ergänzen und die `links`-Liste ersetzen:

```ts
import { getPages } from '../lib/content';
```

```ts
const pageSlugs = new Set((await getPages(lang)).map((page) => page.slug));
const links: { key: NavKey; href: string; label: string }[] = [
  { key: 'destinations', href: pathFor(lang, 'destinations/'), label: d.nav.destinations },
  { key: 'all-over-thailand', href: pathFor(lang, 'all-over-thailand/'), label: d.nav.allOverThailand },
  ...(pageSlugs.has('before-you-come') ? [{ key: 'before-you-come' as const, href: pathFor(lang, 'before-you-come/'), label: d.nav.beforeYouCome }] : []),
  ...(pageSlugs.has('about') ? [{ key: 'about' as const, href: pathFor(lang, 'about/'), label: d.nav.about }] : []),
];
```

- [ ] **Step 6: Prüfen, bauen, E2E laufen lassen**

Run: `npm run verify`
Expected: alles grün. Auf `/de/impressum/` stehen Name und Anschrift jeweils auf eigener Zeile (Markdown-Zeilenumbruch mit `\`). Falls nicht: statt `\` am Zeilenende zwei Leerzeichen verwenden und erneut bauen.

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "feat: Textseiten, Impressum und Datenschutz (Entwurf mit Platzhaltern)

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 10: Link-Prüfung, 404-Seite, Lighthouse und Anleitung

**Files:**
- Create: `scripts/lib/dist-check.mjs`, `scripts/check-dist.mjs`, `src/pages/404.astro`, `README.md`
- Modify: `package.json` (Skript `verify`)
- Test: `tests/unit/dist-check.test.ts`, `tests/e2e/not-found.spec.ts`

**Interfaces:**
- Produces: `extractInternalUrls(html: string): string[]`, `targetFile(distDir: string, url: string): string | null`, `anchorExists(distDir: string, url: string): boolean`, `findPlaceholders(text: string): string[]` aus `scripts/lib/dist-check.mjs`; CLI `node scripts/check-dist.mjs [--strict]` (Exit-Code 1 bei Problemen; `--strict` meldet zusätzlich Platzhalter wie `[VORNAME NACHNAME]`).

- [ ] **Step 1: Failing Unit-Test für die Prüfung schreiben**

`tests/unit/dist-check.test.ts`:

```ts
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { beforeAll, describe, expect, it } from 'vitest';
import { anchorExists, extractInternalUrls, findPlaceholders, targetFile } from '../../scripts/lib/dist-check.mjs';

let dist = '';

beforeAll(() => {
  dist = mkdtempSync(join(tmpdir(), 'tv-dist-'));
  mkdirSync(join(dist, 'en', 'destinations', 'bangkok'), { recursive: true });
  writeFileSync(join(dist, 'en', 'destinations', 'bangkok', 'index.html'), '<article id="tip-bangkok-tichuca"></article>');
  mkdirSync(join(dist, '_astro'));
  writeFileSync(join(dist, '_astro', 'a.webp'), '');
});

describe('extractInternalUrls', () => {
  it('collects internal href, src and srcset urls and ignores external ones', () => {
    const html = '<a href="/en/"></a><a href="https://x.org/"></a><img src="/_astro/a.webp" srcset="/_astro/a.webp 400w, /_astro/b.webp 800w"><a href="//cdn.x/"></a>';
    expect(extractInternalUrls(html).sort()).toEqual(['/_astro/a.webp', '/_astro/b.webp', '/en/']);
  });
});

describe('targetFile and anchorExists', () => {
  it('resolves directories to index.html and files directly', () => {
    expect(targetFile(dist, '/en/destinations/bangkok/')).toBe(join(dist, 'en', 'destinations', 'bangkok', 'index.html'));
    expect(targetFile(dist, '/_astro/a.webp')).toBe(join(dist, '_astro', 'a.webp'));
    expect(targetFile(dist, '/en/nope/')).toBeNull();
  });

  it('checks that the anchor exists on the target page', () => {
    expect(anchorExists(dist, '/en/destinations/bangkok/#tip-bangkok-tichuca')).toBe(true);
    expect(anchorExists(dist, '/en/destinations/bangkok/#tip-missing')).toBe(false);
  });
});

describe('findPlaceholders', () => {
  it('finds bracketed capital placeholders only', () => {
    expect(findPlaceholders('Name: [VORNAME NACHNAME], Mail: [E-MAIL-ADRESSE], array[0], [Link]')).toEqual(['[VORNAME NACHNAME]', '[E-MAIL-ADRESSE]']);
  });
});
```

Run: `npx vitest run tests/unit/dist-check.test.ts`
Expected: FAIL, Modul nicht gefunden.

- [ ] **Step 2: Prüf-Bibliothek und CLI schreiben**

`scripts/lib/dist-check.mjs`:

```js
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';

/** @param {string} html @returns {string[]} */
export function extractInternalUrls(html) {
  const urls = new Set();
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
  return file !== null && readFileSync(file, 'utf8').includes(`id="${hash}"`);
}

/** @param {string} text @returns {string[]} */
export function findPlaceholders(text) {
  return [...text.matchAll(/\[[A-ZÄÖÜ][A-ZÄÖÜ \-]{2,}\]/g)].map((match) => match[0]);
}
```

`scripts/check-dist.mjs`:

```js
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { anchorExists, extractInternalUrls, findPlaceholders, targetFile } from './lib/dist-check.mjs';

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
    if (targetFile(dist, url) === null) problems.push(`${page}: broken link ${url}`);
    else if (!anchorExists(dist, url)) problems.push(`${page}: missing anchor ${url}`);
  }
  if (strict) for (const placeholder of findPlaceholders(html)) problems.push(`${page}: placeholder ${placeholder}`);
}

if (problems.length > 0) {
  console.error(problems.join('\n'));
  process.exit(1);
}
console.log(`dist check ok${strict ? ' (strict)' : ''}`);
```

Run: `npx vitest run tests/unit/dist-check.test.ts`
Expected: PASS (5 Tests).

- [ ] **Step 3: 404-Seite und E2E-Test**

`tests/e2e/not-found.spec.ts`:

```ts
import { expect, test } from '@playwright/test';

test('unknown addresses show the 404 page in both languages', async ({ page }) => {
  const response = await page.goto('/en/does-not-exist/');
  expect(response?.status()).toBe(404);
  await expect(page.getByRole('heading', { level: 1, name: 'Page not found' })).toBeVisible();
  await expect(page.getByRole('link', { name: 'Zurück zum Start' })).toHaveAttribute('href', '/de/');
});
```

`src/pages/404.astro`:

```astro
---
import BaseLayout from '../layouts/BaseLayout.astro';
---
<BaseLayout lang="en" path="" title="Page not found" onlyLangs={['en']} noindex>
  <section class="wrap page-head">
    <p class="label">404</p>
    <h1 class="page-title">Page not found</h1>
    <p class="lead">This page does not exist (anymore). <a href="/en/">Back to the start</a></p>
    <p class="lead" lang="de">Diese Seite gibt es nicht (mehr). <a href="/de/">Zurück zum Start</a></p>
  </section>
</BaseLayout>
```

- [ ] **Step 4: `verify` um die Link-Prüfung erweitern**

In `package.json`:

```json
"verify": "npm run check && npm test && npm run build && node scripts/check-dist.mjs && npm run test:e2e"
```

Run: `npm run verify`
Expected: alles grün, "dist check ok". Meldet die Prüfung kaputte Links oder Anker, die Ursache in der Komponente beheben, die den Link erzeugt, nicht in der Prüfung.

- [ ] **Step 5: Lighthouse auf dem Handy messen**

`preview_start` `tv-preview` (Port 4331), dann:

```bash
mkdir -p .lighthouse
for p in en en/destinations/bangkok; do
  npx lighthouse@latest "http://localhost:4331/$p/" --form-factor=mobile --only-categories=performance,accessibility --chrome-flags="--headless=new" --output=json --output-path=".lighthouse/$(echo $p | tr / -).json" --quiet
done
node -e "for (const f of require('fs').readdirSync('.lighthouse')) { const r = require('./.lighthouse/' + f); console.log(f, Math.round(r.categories.performance.score * 100), Math.round(r.categories.accessibility.score * 100)); }"
```

Expected: beide Werte je Seite mindestens 90. Liegt Performance darunter: in `.lighthouse/*.json` unter `audits['largest-contentful-paint-element']` nachsehen; meist hilft es, beim ersten Foto `sizes` enger zu fassen oder das Startseiten-Bogenbild auf `widths={[480, 800, 1200]}` zu begrenzen.

- [ ] **Step 6: README mit Pflege-Anleitung schreiben**

`README.md`:

````md
# Thailand Vibes

Zweisprachiger Thailand-Guide (EN/DE), gebaut mit Astro.

## Entwickeln

```bash
npm install
npm run dev        # http://localhost:4321/en/
npm run verify     # Typen, Unit-Tests, Bau, Link-Prüfung, Browser-Tests
```

## Einen Tipp ergänzen

1. Datei `src/content/tips/en/<ort>-<name>.md` und dieselbe Datei unter `de/` anlegen (gleicher Dateiname).
2. Pflichtfelder: `place` (z. B. `bangkok` oder `thailand`), `order`, `title`, `category` (siehe `src/i18n/types.ts`).
3. Optional: `number`, `coords: [Breite, Länge]`, `maps`, `facts`, `more`, `skip`, `pinNote`, `featured`, `photos`.
4. Koordinaten aus einem Google-Maps-Link: `node scripts/resolve-maps-link.ts <link>`.
5. `npm run verify`. Der Inhaltstest meldet fehlende Übersetzungen oder abweichende Felder.

Ein neuer Ort bekommt automatisch eine eigene Seite, sobald es den ersten Tipp dafür gibt.

## Fotos

- Eigene Fotos: `node scripts/fetch-wix-photos.ts <nummer>` oder Datei nach `src/assets/photos/` legen (höchstens 2400 px, ohne GPS-Daten).
- Freie Fotos: `node scripts/find-commons-photos.ts <suchbegriff>`, dann `node scripts/fetch-photo.ts <url> <ziel>` und `credit` im Inhalt ausfüllen.

## Veröffentlichen

`npm run deploy` (prüft alles, bricht bei Platzhaltern im Impressum ab und lädt zu Cloudflare hoch).
````

- [ ] **Step 7: Commit**

```bash
git add -A
git commit -m "chore: Link- und Ankerprüfung, 404-Seite, Lighthouse-Messung und README

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 11: Freie Fotos für die Lücken

**Files:**
- Create: `scripts/find-commons-photos.ts`, `scripts/fetch-photo.ts`
- Create: `src/assets/photos/bangkok/free/*.jpg`
- Modify: `src/content/tips/{en,de}/bangkok-jodd-fairs.md`, `bangkok-iconsiam.md`, `bangkok-massage.md`, `bangkok-soi-cowboy.md` und, falls in Task 3 nicht eigene Fotos vorhanden, `bangkok-tichuca.md`, `bangkok-street-food.md`

**Interfaces:**
- Consumes: `download`, `savePhoto` (Task 3); `credit`-Feld im Foto-Schema (Task 2); Anzeige der Angabe in `TipCard` (Task 4) und `EverywhereTiles` (Task 7).

- [ ] **Step 1: Such- und Download-Skript schreiben**

`scripts/find-commons-photos.ts`:

```ts
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
```

`scripts/fetch-photo.ts`:

```ts
import { download, savePhoto } from './lib/photos.ts';

const [url, target] = process.argv.slice(2);
if (!url || !target) {
  console.error('Usage: node scripts/fetch-photo.ts <image url> <target path under src/assets/photos/>');
  process.exit(1);
}
await savePhoto(await download(url), target);
console.log(`saved ${target}`);
```

- [ ] **Step 2: Kandidaten suchen und der Autorin zeigen**

```bash
node scripts/find-commons-photos.ts Jodd Fairs Rama 9
node scripts/find-commons-photos.ts IconSiam Bangkok
node scripts/find-commons-photos.ts Thai massage spa
node scripts/find-commons-photos.ts Soi Cowboy Bangkok
```

Je Lücke 2 bis 3 passende Kandidaten (Querformat oder Hochformat, mindestens 1200 px, keine erkennbaren Gesichter im Vordergrund) auswählen und die `page`-Links mit `preview_start` im Browser öffnen, damit die Autorin sie sieht. Mit AskUserQuestion pro Lücke fragen, welches Foto sie möchte (Option "Keins, lieber ohne Foto" anbieten).

- [ ] **Step 3: Download freigeben lassen und herunterladen**

Vor dem Download mit AskUserQuestion bestätigen lassen: Dateiname, Quelle (commons.wikimedia.org) und ungefähre Größe (unter 2 MB je Foto). Dann pro Foto:

```bash
node scripts/fetch-photo.ts "<file-URL aus der Suche>" src/assets/photos/bangkok/free/jodd-fairs.jpg
```

- [ ] **Step 4: Fotos mit Quellenangabe eintragen**

Beispiel `src/content/tips/en/bangkok-jodd-fairs.md` (DE identisch bis auf `alt`):

```yaml
photos:
  - src: ../../../assets/photos/bangkok/free/jodd-fairs.jpg
    alt: Food stalls and string lights at Jodd Fairs
    credit:
      author: <Artist aus der Suche>
      license: <LicenseShortName, z. B. CC BY-SA 4.0>
      licenseUrl: <LicenseUrl>
      source: <page-URL>
```

- [ ] **Step 5: Prüfen und Commit**

Run: `npm run verify`
Expected: alles grün; auf `/en/destinations/bangkok/` steht unter jedem freien Foto "Photo: <Name>, <Lizenz>".

```bash
git add -A
git commit -m "feat: freie Fotos mit Quellenangabe für Tipps ohne eigene Bilder

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

---

### Task 12: Veröffentlichen bei Cloudflare

**Files:**
- Create: `wrangler.jsonc`, `public/_redirects`, `public/_headers`
- Modify: `package.json` (Skript `deploy`), `astro.config.mjs` (`site`), `src/content/pages/de/impressum.md`, `src/content/pages/de/datenschutz.md`

**Interfaces:**
- Consumes: `check-dist --strict` (Task 10), `TV_BASE_URL` in `playwright.config.ts` (Task 1).

- [ ] **Step 1: Angaben für Impressum und Datenschutz einholen**

Die Autorin fragen nach Name, Anschrift (ladungsfähig) und E-Mail-Adresse für das Impressum, und ob sie den Entwurf der Datenschutzerklärung so übernimmt. Die Platzhalter `[VORNAME NACHNAME]`, `[STRASSE HAUSNUMMER]`, `[PLZ ORT]` und `[E-MAIL-ADRESSE]` in beiden Dateien ersetzen. Dann:

Run: `npm run build && node scripts/check-dist.mjs --strict`
Expected: "dist check ok (strict)".

- [ ] **Step 2: Cloudflare-Konfiguration schreiben**

```bash
npm i -D wrangler@^4.151.1
```

`wrangler.jsonc`:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "thailand-vibes",
  "compatibility_date": "2026-10-18",
  "assets": {
    "directory": "./dist",
    "not_found_handling": "404-page",
    "html_handling": "auto-trailing-slash"
  }
}
```

`public/_redirects`:

```
/  /en/  302
```

`public/_headers`:

```
/_astro/*
  Cache-Control: public, max-age=31536000, immutable

/*
  X-Content-Type-Options: nosniff
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: camera=(), microphone=(), geolocation=()
```

In `package.json` ergänzen:

```json
"deploy": "npm run verify && node scripts/check-dist.mjs --strict && wrangler deploy"
```

- [ ] **Step 3: Anmeldung durch die Autorin**

Die Autorin bitten, ein Cloudflare-Konto anzulegen (oder ein bestehendes zu nutzen) und im Terminal selbst einzuloggen; Claude legt keine Konten an und gibt keine Zugangsdaten ein:

```bash
npx wrangler login
```

Expected: `npx wrangler whoami` zeigt ihr Konto.

- [ ] **Step 4: Erstes Deployment und Adresse eintragen**

```bash
npm run deploy
```

Expected: Ausgabe mit der Adresse, z. B. `https://thailand-vibes.<konto>.workers.dev`. Diese Adresse in `astro.config.mjs` als `site: 'https://thailand-vibes.<konto>.workers.dev'` eintragen (für canonical und hreflang) und erneut `npm run deploy`.

- [ ] **Step 5: Live-Seite prüfen**

```bash
TV_BASE_URL=https://thailand-vibes.<konto>.workers.dev npx playwright test tests/e2e/layout.spec.ts tests/e2e/place.spec.ts tests/e2e/map.spec.ts
```

Expected: alles grün; `/` leitet sofort auf `/en/` weiter, die Karte lädt.

- [ ] **Step 6: Commit und Abschluss**

```bash
git add -A
git commit -m "chore: Veröffentlichung bei Cloudflare eingerichtet

Co-Authored-By: Claude Opus 5.5 <noreply@anthropic.com>"
```

Danach mit superpowers:finishing-a-development-branch den Branch `umsetzung` abschließen.
