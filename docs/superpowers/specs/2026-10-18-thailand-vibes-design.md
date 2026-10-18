# Thailand Vibes: Spezifikation

Stand: 18.10.2026. Abgestimmt im Gespräch vom 08.10.2026.
Vorlagen: `docs/superpowers/mockups/startseite.html`, `docs/superpowers/mockups/bangkok.html` und die Handy-Screenshots in `docs/superpowers/mockups/handy/`.

## 1. Ziel

Der alte Wix-Blog "Thailand Vibes" (https://elisabethekkraus.wixsite.com/thailand-vibes) wird als moderne, eigene Website neu gebaut und erweitert.

- **Zweck:** ein Guide für Freunde, die nach Thailand reisen. Im Mittelpunkt stehen die Insider-Tipps: was wir in jeder Destination empfehlen, was wir für ganz Thailand empfehlen und was wir auslassen würden. Es ist kein Reisetagebuch und keine Route.
- **Publikum:** öffentlich, für alle auffindbar (auch über Google).
- **Sprachen:** Englisch (Original) und Deutsch, mit Umschalter.
- **Pflege:** Die Autorin liefert Texte und Fotos, Claude baut sie ein. Ein Redaktionssystem mit Login gibt es nicht.
- **Kosten:** keine laufenden Kosten. Eine eigene Domain ist optional und kommt später.

**Erfolgskriterien**
1. Alle Inhalte der alten Bangkok-Seite (11 Tipps) sind übernommen, in beiden Sprachen.
2. Die Seite sieht auf großen Bildschirmen (1920 px) und auf dem Handy (390 px) so aus wie die abgestimmten Entwürfe.
3. Filter, Karten und Sprachumschalter funktionieren auf Desktop und Handy.
4. Lighthouse auf dem Handy: Performance und Barrierefreiheit jeweils mindestens 90.
5. Die Seite läuft kostenlos öffentlich erreichbar.

## 2. Entscheidungen aus dem Gespräch

| Thema | Entscheidung |
|---|---|
| Zweck | Guide für Freunde (Destinationen, Empfehlungen, ganz Thailand, "würde ich auslassen") |
| Technik | Astro, statische Seite |
| Sprache | Englisch und Deutsch |
| Pflege | Inhalte als Textdateien, Einbau durch Claude |
| Sichtbarkeit | öffentlich |
| Look | A "Magazin": Creme und Tiefrot, Serifenschrift, Fotos im Tempelbogen |
| Extras | Filter nach Kategorie, interaktive Karte (keine gezeichnete Route) |
| Fotos | eigene Fotos aus dem Wix-Blog; Lücken mit freien Fotos samt Fotografen-Angabe |
| Karte | OpenFreeMap, Beschriftung in der Seitensprache |
| Hosting | Cloudflare (kostenlos); das Konto legt die Autorin selbst an |
| Orte ohne Texte | auf Startseite und Karte sichtbar, aber ohne Link auf eine leere Unterseite |
| Rechtliches | Impressum und Datenschutzerklärung als schlichte Seiten im Fußbereich |
| Übersetzung | Claude übersetzt ins Deutsche, die Autorin liest gegen |

## 3. Seiten und Adressen

Jede Seite gibt es unter `/en/...` und `/de/...`. Die Adressen sind in beiden Sprachen gleich, nur der Sprachteil ändert sich. Der Sprachumschalter führt immer zur selben Seite in der anderen Sprache. Die Adresse `/` leitet auf `/en/` weiter.

| Seite | Adresse | Inhalt |
|---|---|---|
| Startseite | `/en/` | siehe Abschnitt 5 |
| Destinations | `/en/destinations/` | alle Orte nach Region gruppiert, Thailand-Karte, Block "würde ich auslassen" |
| Ortsseite | `/en/destinations/bangkok/` | siehe Abschnitt 6 |
| Essen und Trinken | `/en/destinations/bangkok/food/` | Restaurants nach Küche, mit Filter und Karte |
| All over Thailand | `/en/all-over-thailand/` | alle Tipps für ganz Thailand, mit Filter |
| Before you come | `/en/before-you-come/` | Infoleiste (beste Reisezeit, Geld, Visum, SIM-Karte, Transport), darunter Details |
| About | `/en/about/` | kurz über uns, Text von der Autorin |
| Impressum | `/de/impressum/` | nur auf Deutsch, aus beiden Sprachen verlinkt |
| Datenschutz | `/de/datenschutz/` | nur auf Deutsch, aus beiden Sprachen verlinkt |

**Regeln für unfertige Inhalte**
- Eine Ortsseite entsteht automatisch, sobald es zu diesem Ort mindestens einen Tipp gibt. Vorher erscheint der Ort nur auf Startseite, Destinations-Seite und Karte, ohne Link.
- "Before you come" und "About" stehen erst im Menü, wenn ihr Text vorliegt.
- Die Essen-und-Trinken-Seite zeigt nur Küchen, zu denen es Restaurants gibt.

**Navigation:** oben Destinations, All over Thailand, Before you come, About und der Sprachumschalter EN / DE. Auf dem Handy (unter 900 px) ersetzt ein Menü-Button die Links, der Sprachumschalter bleibt sichtbar. Im Fußbereich stehen Impressum, Datenschutz und der Sprachumschalter. Von der Bangkok-Seite (Tipp 8) führt ein Link zur Essen-und-Trinken-Seite.

## 4. Gestaltung

Verbindlich sind die beiden Entwürfe in `docs/superpowers/mockups/`. Die Werte daraus:

**Farben**

| Name | Wert | Einsatz |
|---|---|---|
| bg | `#F2EBDD` | Seitenhintergrund (Creme) |
| ink | `#2A211B` | Text, dunkle Flächen, Buttons |
| red | `#A63A2B` | Akzent: Labels, Nummern, aktive Filter, aktive Pins |
| card | `#FBF7EF` | Karten für Tipps und Orte |
| muted | `#8A7B6C` | Nebentext |
| sand | `#E7DCC8` | Landfläche der Karte, helle Kacheln |
| skip | `#E08A6E` | Akzent auf dunklem Grund ("I would skip") |

**Schriften:** Fraunces (Überschriften, Nummern, Logo kursiv) und Inter (Fließtext, Labels). Beide werden selbst gehostet (Fontsource), es gibt keine Anfrage an Google Fonts.

**Formen und Maße**
- Fotos im Tempelbogen: oben vollständig rund, unten 10 bis 12 px Radius. Format 4:5, das mittlere Foto auf der Startseite 3:4, auf dem Handy bei Ortsseiten 1:1.
- Karten und Kacheln: 18 px Radius.
- Labels: Großbuchstaben, 0,16em Laufweite, Tiefrot.
- Inhaltsbreite höchstens 1480 px, Seitenrand `clamp(18px, 4vw, 64px)`.
- Alle Schriftgrößen wachsen mit der Breite (`clamp()`), z. B. Startseiten-Titel `clamp(64px, 13vw, 250px)`, Ortsname `clamp(72px, 12vw, 230px)`. Feste Bildhöhen gibt es nicht, nur Seitenverhältnisse. Das war die Lehre aus Version 1 der Startseite: Auf 2000 px breiten Bildschirmen waren Titel zu klein und Fotos zu flachen Streifen beschnitten.

**Handy:** Unter 900 px wird alles einspaltig, die Karte steht über der Liste (nicht mitlaufend), die Filterleiste lässt sich seitlich wischen statt umzubrechen, und Fotos stehen zu zweit nebeneinander.

**Bewegung:** Bei `prefers-reduced-motion` gibt es kein weiches Scrollen und keine Kartenanimation.

**Barrierefreiheit:** Jedes Foto hat einen Alternativtext. Filter sind echte Buttons, per Tastatur bedienbar und mit `aria-pressed`. Pins auf der Karte haben einen Namen. Die Kontraste erfüllen WCAG AA.

## 5. Startseite

Von oben nach unten (Vorlage `startseite.html`):

1. **Kopf:** Label "Insider tips from Bangkok", Titel "Thailand *Vibes*" ("Vibes" kursiv in Tiefrot), darunter drei Fotos im Tempelbogen, die leicht in den Titel ragen: TukTuk bei Nacht, Wat Paknam, Bang Kachao.
2. **Begrüßung:** Text der alten Destinations-Seite ("This is your first time to Thailand ... No worries, we got you!").
3. **Where to go:** links eine Thailand-Karte, die beim Scrollen stehen bleibt, rechts die Orte nach Region: The capital, My top islands, The beautiful north, Weekend trips from Bangkok. Jede Ortskarte zeigt das Intro und bis zu vier empfohlene Tipps (Feld `featured`) mit Kategorie. Der Ort, den man gerade liest, leuchtet auf der Karte auf. Orte mit eigener Seite haben einen Link ("All 11 tips →").
4. **What we recommend everywhere:** Kacheln mit einer Auswahl der Tipps für ganz Thailand, mit Filter nach Kategorie und Link zur Seite "All over Thailand". Welche Tipps hier erscheinen, steuert ein Feld im Tipp (`featured`).
5. **Hyped, but I would totally skip:** dunkler Block mit den "würde ich auslassen"-Einträgen, jeweils mit "Go to ... instead →".
6. **Fußbereich:** Impressum, Datenschutz, Sprachumschalter.

**Thailand-Karte:** eine exakte SVG-Grafik, erzeugt aus Natural-Earth-Daten (gemeinfrei) samt Inseln. Die Pins werden aus den Koordinaten der Orte berechnet. Die Skizze im Entwurf ist nur ein Platzhalter.

## 6. Ortsseite (Beispiel Bangkok)

Vorlage `bangkok.html`.

1. **Kopf:** Brotkrumen "Destinations / The capital", Label "11 tips · where we lived", Ortsname groß, Intro der Autorin, rechts das Titelfoto im Tempelbogen.
2. **Filterleiste:** bleibt beim Scrollen oben stehen. Ein Button "All" plus eine Kategorie je vorkommender Kategorie, jeweils mit Anzahl. Ein Klick blendet die anderen Tipps und ihre Pins aus, die Karte zoomt auf die verbleibenden Pins, und die Liste springt an den Anfang.
3. **Tipps (links) und Karte (rechts):** Die Karte bleibt beim Scrollen stehen. Der Pin zum Tipp in der Bildschirmmitte ist rot hervorgehoben. Ein Klick auf einen Pin scrollt zum Tipp. Tipps ohne festen Ort (TukTuk, Massage, Streetfood) haben keinen Pin und tragen einen Hinweis wie "no fixed spot".
4. **Tipp-Karte:** Nummer (01 bis 10, dann "10+1"), Kategorie, Titel, Text, Infozeilen (z. B. Open, Entry, Wear, Getting there), optional ein "More ..."-Block (z. B. "More markets"), optional ein dunkler "I would skip"-Kasten, Button "Open in Google Maps ↗" (öffnet den Original-Link der Autorin), Fotos rechts daneben (auf dem Handy darunter).

**Kategorien** (feste Liste, in beiden Sprachen übersetzt): Temples, Markets, Rooftops, Food, Shopping, Nightlife, Wellness, Nature, Getting around. Für "All over Thailand" kommen hinzu: Drinks, Etiquette.

## 7. Inhaltsmodell

Astro Content Collections mit Schema-Prüfung (Zod). Ein Tippfehler in einem Pflichtfeld bricht den Bau ab, statt eine kaputte Seite zu erzeugen.

Jeder Eintrag ist eine Markdown-Datei pro Sprache, z. B. `src/content/tips/en/bangkok-wat-paknam.md` und `src/content/tips/de/bangkok-wat-paknam.md`. Gleicher Dateiname heißt gleicher Eintrag. Fehlt die deutsche Datei, bricht der Bau ab.

**places** (Orte)
- `name`, `slug`, `region` (capital, islands, north, weekend-trips), `intro`, `order`
- `coords` (Breite, Länge), `cover` (Foto, optional)

**tips** (Tipps)
- `place` (Verweis auf einen Ort oder `thailand` für ganz Thailand), `number` (Anzeige, z. B. "01" oder "10+1"), `order`
- `title`, `category`, Text als Markdown-Inhalt
- `facts`: Liste aus Bezeichnung und Wert (z. B. Open / Daily 6am to 8pm)
- `more` (optional): Überschrift und Text
- `skip` (optional): Text für den "I would skip"-Kasten
- `mapsUrl` (optional), `coords` (optional, ohne Koordinaten kein Pin), `pinNote` (optional, z. B. "no fixed spot")
- `photos`: Liste aus Datei, Alternativtext und optional Fotografen-Angabe mit Lizenz und Quelle
- `featured`: bei Tipps eines Ortes erscheint der Tipp in der Ortskarte auf Startseite und Destinations-Seite (höchstens vier je Ort); bei Tipps für ganz Thailand erscheint er in den Kacheln der Startseite

**restaurants**
- `place`, `name`, `cuisine` (thai, brunch, italian, mediterranean, japanese), `price` (z. B. "about 4 € per dish"), Text, `mapsUrl`, `coords`, `photos` (optional)

**skips** ("würde ich auslassen")
- `title`, Text, `instead` (optional: Verweis auf einen Tipp und Linktext)

**Textseiten:** Before you come und About als Markdown-Seiten pro Sprache. Before you come hat zusätzlich ein Feld `facts` für die Infoleiste.

**Oberflächentexte** (Menü, Buttons, Labels, Kategorienamen) liegen in `src/i18n/en.ts` und `src/i18n/de.ts`. Fehlt ein Schlüssel in einer Sprache, schlägt die Typprüfung fehl.

## 8. Startinhalte

Quelle ist die alte Wix-Seite. Alle Texte stammen von der Autorin und werden nur gekürzt, nicht umgeschrieben.

**Orte:** Bangkok (mit Seite), Koh Phangan, Chiang Mai, Chiang Rai, Kanchanaburi (vorerst ohne Seite, nur Intro aus der Destinations-Seite).

**Bangkok, 11 Tipps:** 01 Wat Paknam Phasi Charoen, 02 Jodd Fairs, 03 Tichuca, 04 Hop on a TukTuk, 05 Chinatown after sunset, 06 IconSiam, 07 Get a massage, 08 Try local (street) food, 09 Party at Khao San Road, 10 Soi Cowboy, 10+1 Recharge on Bang Kachao. Texte, Öffnungszeiten, "More"-Blöcke und Maps-Links wie auf der Wix-Seite. Die Koordinaten werden aus den Google-Maps-Kurzlinks ausgelesen.

**Restaurants Bangkok (Thai):** The Local, Shamballa Somtam, Taling Pling Sukhumvit 34, NAAM 1608, Nhong Rim Klong, Baan Suan Sathon, Supanniga Eating Room Tha Tian, Mae Varee. Texte und Preise aus Tipp 8.

**Ganz Thailand** (aus dem Bangkok-Text, in den Worten der Autorin): Mango sticky rice, Pad Krapao Moo mit kai dao, Gai Pad Med Mamuang, Pad See Ew, Fruchtshakes ohne Zucker ("mai ao namdtan"), Kokos-Eis vom Wagen, Singha statt Chang, Tempel-Kleiderordnung, Massage-Tipps, Schärfe am Markt ansagen und kein roher Fisch am Markt, getrocknete Mango als Mitbringsel, Tofu-Option für Vegetarier.

**Würde ich auslassen:** Sky Bar at Lebua (stattdessen Tichuca).

## 9. Mehrsprachigkeit

- Eingebautes i18n-Routing von Astro, Sprachen `en` (Standard) und `de`, beide mit Sprachpräfix.
- Jede Seite setzt `lang`, `hreflang`-Verweise auf die andere Sprache und eine kanonische Adresse.
- Die Kartenbeschriftung folgt der Seitensprache: Englisch `name:en`, Deutsch `name:de`, dann `name:en`, dann `name`.

## 10. Karten

- **Ortskarten:** MapLibre GL JS mit dem Stil "positron" von OpenFreeMap (kostenlos, ohne Schlüssel und ohne Anmeldung). Die Karte wird mit einem Sepia-Filter in den Creme-Ton gebracht. Die Pins sind eigene HTML-Elemente im Stil des Entwurfs. Das Scrollrad zoomt die Karte nicht (sonst bleibt man beim Scrollen der Seite in der Karte hängen), Zoom per Buttons und Fingergeste.
- MapLibre wird nur auf Seiten mit Karte geladen, und zwar erst, wenn Text und Fotos stehen (dynamischer Import). So bleibt die Seite auf dem Handy schnell, und das Lighthouse-Ziel aus Abschnitt 1 ist erreichbar.
- Lädt die Karte nicht (z. B. offline), bleibt die Fläche ruhig in Sandfarbe. Die Tipps und Maps-Buttons funktionieren weiter.
- Die OpenStreetMap-Server selbst werden nicht verwendet. Im Test wurden sie blockiert, und ihre Nutzungsregeln passen nicht zu dieser Seite.

## 11. Fotos

**Quellen**
- Eigene Fotos der Autorin werden in voller Auflösung von Wix heruntergeladen. Vor dem Download bekommt die Autorin die Dateiliste und gibt sie frei.
- Fotos aus dem Internet werden nicht übernommen. Lücken werden mit Fotos unter freier Lizenz gefüllt (Unsplash, Wikimedia Commons), mit Fotografen-Angabe als kleine Bildunterschrift.
- Astro erzeugt aus jedem Foto passende Größen in AVIF und WebP. Fotos liegen in `src/assets/photos/`.

**Bestand der alten Bangkok-Seite** (35 Bilder, Nummern wie im Anhang):

| Tipp | eigene Fotos | unklar | aus dem Internet |
|---|---|---|---|
| Kopf | | | 0 |
| 01 Wat Paknam | 1, 2, 3 | | |
| 02 Jodd Fairs | | | 4, 5, 6 |
| 03 Tichuca | | 7, 8 | 9 |
| 04 TukTuk | 10, 11 | | |
| 05 Chinatown | 14, 15 | | 12 (Adobe Stock), 13 (Wikimedia/Flickr) |
| 06 IconSiam | | | 16, 17, 18 |
| 07 Massage | | | 19, 20, 21 |
| 08 Streetfood | | 22, 24 (Bildschirmfotos) | 23 |
| 09 Khao San | 25, 26, 27 | | |
| 10 Soi Cowboy | | | 28, 29, 30 |
| 10+1 Bang Kachao | 31, 32, 33 | | |

Bild 34 ist ein Wix-Hintergrund und wird nicht gebraucht.

**Freie Fotos nötig für:** Jodd Fairs, IconSiam, Massage, Soi Cowboy, dazu Tichuca und Streetfood, falls die unklaren Fotos nicht von der Autorin sind.

## 12. Technik

- **Astro** in der aktuellen stabilen Version, statische Ausgabe, TypeScript im strengen Modus. Keine UI-Bibliothek (kein React o. Ä.). Die wenigen interaktiven Teile sind kleine TypeScript-Module: Filter, Ortskarte, Thailand-Karte, Menü.
- **Abhängigkeiten:** `maplibre-gl`, `@fontsource-variable/fraunces`, `@fontsource-variable/inter`, für die Tests Playwright. Sonst so wenig wie möglich.
- **Projektordner:** `~/Code/thailand-vibes`, eigenes Git-Repository.
- **Hosting:** Cloudflare (statische Dateien), kostenlos. Das Konto legt die Autorin an. Ob über GitHub verbunden oder direkt aus dem Projekt hochgeladen wird, klärt der Umsetzungsplan.
- **Kein** Tracking, keine Cookies, keine Formulare.

## 13. Datenschutz und Rechtliches

- Schriften selbst gehostet, keine Google-Dienste.
- Externe Anfragen gibt es nur an OpenFreeMap (Kartenkacheln). Das steht in der Datenschutzerklärung.
- Impressum und Datenschutzerklärung als schlichte Seiten. Die persönlichen Angaben (Name, Anschrift, Kontakt) liefert die Autorin. Claude schreibt einen Entwurf. Eine Rechtsberatung ersetzt das nicht.
- Fotos mit erkennbaren Personen (26, 31, 32) gehen nur online, wenn die Abgebildeten einverstanden sind.

## 14. Qualität und Tests

- `astro check`: Typen und Inhalts-Schemas.
- Bau ohne Fehler und Warnungen, dazu eine Prüfung aller internen Links im fertigen Ergebnis.
- Playwright-Klicktests (Desktop 1920 px und Handy 390 px):
  - Filter blendet Tipps und Pins passend aus und wieder ein.
  - Sprachumschalter führt zur gleichen Seite in der anderen Sprache.
  - Menü-Button öffnet und schließt das Menü auf dem Handy.
  - Kein waagrechtes Scrollen auf dem Handy.
  - Ortskarte zeigt so viele Pins, wie Tipps mit Koordinaten sichtbar sind.
- Sichtprüfung jeder Seite im Browser bei 1920, 1280 und 390 px vor jeder Abnahme.
- Lighthouse auf dem Handy für Startseite und Bangkok: Performance und Barrierefreiheit mindestens 90.

## 15. Was die Autorin noch liefert

1. Texte für Chiang Mai, Chiang Rai, Kanchanaburi, Koh Phangan und die beiden weiteren Top-Inseln
2. Texte für Before you come und About
3. Restaurants für Brunch, Italian, Mediterranean, Japanese
4. Weitere "würde ich auslassen"-Einträge
5. Entscheidung zu den unklaren Fotos 7, 8, 22, 24 und Einverständnis zu den Fotos mit Personen (26, 31, 32)
6. Angaben für Impressum und Datenschutz
7. Cloudflare-Konto
8. Gegenlesen der deutschen Übersetzung

Nichts davon blockiert den Start. Fehlende Inhalte erscheinen einfach später (siehe Regeln in Abschnitt 3).

## 16. Nicht Teil dieser Version

Redaktionssystem mit Login, Kommentare, Newsletter, Suche, "Ein perfekter Tag in Bangkok", Reiseroute, dunkles Farbschema, Besucherstatistik, eigene Domain, weitere Länder. Alles davon lässt sich später ergänzen.

## Anhang: Fotos der alten Bangkok-Seite

Wix-Medien-IDs in der Reihenfolge der Seite. Download-Adresse: `https://static.wixstatic.com/media/<ID>`.

| Nr. | Wix-ID | Originalname |
|---|---|---|
| 0 | 516253_0d4c25677e5043999b8fb3c6a0e6f04f~mv2.webp | BANGKOK-riverside-hotels-1024x682.webp |
| 1 | 516253_15dad8d3e17d4ce1a900a836db613c17~mv2.jpg | 2023-01-28.jpg |
| 2 | 516253_21aa8a76234b441f9a9770fbf6efe2bd~mv2.png | IMG_1602 2.heic |
| 3 | 516253_9636ac7001814290a2f09ccc0dc4d351~mv2.jpg | IMG_1616_edited.jpg |
| 4 | 516253_fd42611ddd4a4363a39ced088ab789dd~mv2.webp | S_Bangkok-Jodd-Fairs-228452JMP.webp |
| 5 | 516253_3c8be7e27c79418fb5198ffe86ac70dc~mv2.jpg | jodd-4.jpg |
| 6 | 516253_ae28f95700504ba58e1d94de52c9cb80~mv2.webp | Outdoor-seating-area-and-bar-at-Jodd-Fairs-Night-Market-in-Bangkok.webp |
| 7 | 516253_ddee51d95fe64669bc5e1fb6d9392b75~mv2.jpg | image.jpg |
| 8 | 516253_d4140c6e482946c28174e15470ccbf2d~mv2.jpg | 146242384_115785217117117_5206243032670287529_n.jpg |
| 9 | 516253_f0bf0571fd5343f5a65096bff2763cab~mv2.png | Tichuca-Rooftop-Bar-04-978x550.png |
| 10 | 516253_1de3482ca02546798e5eccb8e818e82e~mv2.png | IMG_5284.HEIC |
| 11 | 516253_2e1378d38ee5438a967263535fd0747b~mv2.png | IMG_1044.HEIC |
| 12 | 516253_56d7588d8dc54ab794602bf9dec3cfda~mv2.jpg | 1000_F_251110013_vUgjWRGa3C0TC4xjfCDvcRPWYj6TAwEw.jpg |
| 13 | 516253_6d7eaefb8de54a6f82c3097724ece29c~mv2.jpg | Yaowarat_at_night_(32455695783).jpg |
| 14 | 516253_0347237fe27b4f82b9d86a5dc753581e~mv2.png | IMG_2833.HEIC |
| 15 | 516253_23e4b08a4c8146d0a9910fa0278a02a4~mv2.png | IMG_3376.HEIC |
| 16 | 516253_e40f329adcba421ba7abfabe1a1380bb~mv2.webp | iconsiam.webp |
| 17 | 516253_a3e755a785ff4719861d3b3a2a77e936~mv2.jpeg | iconsiamwaterfall.jpeg |
| 18 | 516253_1f3fbdd368a14874b3ff8d8448b9df06~mv2.jpg | iconsiam-21-900x600.jpg |
| 19 | 516253_73e6aee2c2064c0a9cef8c2e7564fbf1~mv2.jpg | divana.jpg |
| 20 | 516253_afdc513239f04b058edf4b9b18a1cdbe~mv2.jpg | massage.jpg |
| 21 | 516253_43699d0d587f459fbfb5bafa1d3106ae~mv2.jpeg | infinity.jpeg |
| 22 | 516253_c18996615947453a91c2521b1f3296cb~mv2.png | Bildschirmfoto 2024-10-22 um 23.02.16.png |
| 23 | 516253_434161fb68bf40bcacbd8119dfab3ba2~mv2.jpg | sticky-rice-with-mango-recipe-700x525.jpg |
| 24 | 516253_efefb961182540a69de41f885cd2f5e3~mv2.png | Bildschirmfoto 2024-10-22 um 23.08.38.png |
| 25 | 516253_4d2f2106d56243259385ee48d193f53e~mv2.png | IMG_6765.HEIC |
| 26 | 516253_7739ea3588fd4078b61e523c400809a3~mv2.png | IMG_6763 2.HEIC |
| 27 | 516253_9ef6a6b23e0a471e86d311ab990440de~mv2.png | IMG_2267.HEIC |
| 28 | 516253_3ef920395ca545829bd1e74860738250~mv2.jpg | soi-cowboy-bangkok-rotlichtviertel-1.jpg |
| 29 | 516253_5c6d6226a30942afb1a69f300e9c2171~mv2.webp | soi-cowboy-thailand.webp |
| 30 | 516253_5513efc2495240879cc5bb035e167657~mv2.jpeg | images.jpeg |
| 31 | 516253_a79bf06fb0aa48fdaf20dc1b61d8228d~mv2.png | IMG_6217.HEIC |
| 32 | 516253_04b5334fe76c4dce9ec2fed1cc089950~mv2.png | IMG_3592 2.HEIC |
| 33 | 516253_19234ce0b9a94c7fb3a6d52f6bbf9b25~mv2.png | IMG_0006.HEIC |
| 34 | a3c153_bbf1019446e34069a3b96c18f172e810~mv2.jpg | (Wix-Hintergrund) |
