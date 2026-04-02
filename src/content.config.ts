import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const blog = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/blog' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    pubDate: z.date(),
    author: z.enum(['Ondra', 'Jára']).default('Ondra'),
    lang: z.enum(['cs', 'en']).default('cs'),
    tags: z.array(z.string()).default([]),
    image: z.string().optional(),
    readTime: z.number().optional(),
  }),
});

export const collections = { blog };
