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
