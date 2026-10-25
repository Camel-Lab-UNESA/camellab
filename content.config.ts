import { defineCollection, defineContentConfig, z } from '@nuxt/content'
import { VISIBILITIES } from './shared/utils/visibility.ts'

// `minutes` is filled in at build time by the content:file:afterParse hook in nuxt.config.ts.
const post = z.object({
  date: z.date(),
  author: z.string(),
  minutes: z.number().default(1),
  // Enforced in server/api/posts; see server/utils/content.ts for why pages never query these collections directly.
  visibility: z.enum(VISIBILITIES).default('public')
})

export default defineContentConfig({
  collections: {
    // One file per language: about/en.md and about/id.md feed the landing page.
    about: defineCollection({
      type: 'page',
      source: 'about/*.md',
      schema: z.object({ tagline: z.string() })
    }),
    news: defineCollection({ type: 'page', source: 'news/*.md', schema: post }),
    articles: defineCollection({ type: 'page', source: 'articles/*.md', schema: post })
  }
})
