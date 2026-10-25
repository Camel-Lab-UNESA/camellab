import { createError, defineEventHandler } from 'h3'
import { hasContentKey } from '~~/server/utils/content'
import { SECTIONS } from '~~/server/utils/posts'

const PRIVATE = new RegExp(`^/+__nuxt_content/+(?:${SECTIONS.join('|')})(?:/|$)`, 'i')

// See server/utils/content.ts.
export default defineEventHandler((event) => {
  let path = event.path
  try {
    path = decodeURIComponent(path)
  } catch {
    // Malformed escapes can't reach a Nuxt Content route either.
  }
  if (PRIVATE.test(path) && !hasContentKey(event)) {
    throw createError({ statusCode: 404, statusMessage: 'Not found' })
  }
})
