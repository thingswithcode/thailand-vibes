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
  footer: { label: 'Footer' },
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
