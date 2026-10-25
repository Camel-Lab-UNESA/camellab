import { randomUUID } from 'node:crypto'
import { getHeader } from 'h3'
import type { H3Event } from 'h3'
import type { Section } from './posts'

// Posts can be limited to some roles, but Nuxt Content serves every collection to the browser as a
// full SQL dump and runs any SELECT sent to its query route. So server/middleware/content.ts closes
// /__nuxt_content/{news,articles}/* to requests without this per-process key, and pages read posts
// through server/api/posts, which filters by role. Nuxt Content's server-side query copies the
// incoming request's headers onto its internal fetch, which is how the key gets there.
const HEADER = 'x-camellab-content'
const KEY = randomUUID()

export function queryPosts(event: H3Event, section: Section) {
  event.node.req.headers[HEADER] = KEY
  return queryCollection(event, section)
}

export function hasContentKey(event: H3Event): boolean {
  return getHeader(event, HEADER) === KEY
}
