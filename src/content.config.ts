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
