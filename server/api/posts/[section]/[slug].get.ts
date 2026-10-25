import { createError, defineEventHandler, getRouterParam } from 'h3'
import { viewerRole } from '~~/server/utils/admin'
import { queryPosts } from '~~/server/utils/content'
import { isSection } from '~~/server/utils/posts'
import { visibleTo } from '~~/shared/utils/visibility'

export default defineEventHandler(async (event) => {
  const section = getRouterParam(event, 'section')
  const slug = getRouterParam(event, 'slug')
  if (!isSection(section) || !slug) throw createError({ statusCode: 404, statusMessage: 'Not found' })

  const role = await viewerRole(event)
  const path = `/${section}/${slug}`
  const post = await queryPosts(event, section).path(path).where('visibility', 'IN', visibleTo(role)).first()
  if (post) return post

  // Signed-out visitors learn that a restricted post exists, so the page can ask them to sign in.
  const hidden = !role && await queryPosts(event, section).path(path).select('path').first()
  throw createError(hidden
    ? { statusCode: 401, statusMessage: 'Sign in required' }
    : { statusCode: 404, statusMessage: 'Not found' })
})
