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
  footer: { label: 'Fußbereich' },
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
