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

`npm run deploy` prüft alles und veröffentlicht `dist/` auf dem Branch `gh-pages` von `thingswithcode/thailand-vibes`. Die Seite liegt dann unter https://thingswithcode.github.io/thailand-vibes/.
