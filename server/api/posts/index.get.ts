import { createError, defineEventHandler, getQuery } from 'h3'
import { viewerRole } from '~~/server/utils/admin'
import { queryPosts } from '~~/server/utils/content'
import { isSection } from '~~/server/utils/posts'
import { visibleTo } from '~~/shared/utils/visibility'

export default defineEventHandler(async (event) => {
  const { section } = getQuery(event)
  if (!isSection(section)) throw createError({ statusCode: 400, statusMessage: 'Unknown section' })

  const allowed = visibleTo(await viewerRole(event))
  return queryPosts(event, section)
    .where('visibility', 'IN', allowed)
    .order('date', 'DESC')
    .select('title', 'description', 'date', 'author', 'minutes', 'path', 'visibility')
    .all()
})
