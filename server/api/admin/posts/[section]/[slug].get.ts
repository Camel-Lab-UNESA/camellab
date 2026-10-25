import { createError, defineEventHandler, getRouterParam } from 'h3'
import { requireInternal } from '~~/server/utils/admin'
import { getFile } from '~~/server/utils/github'
import { isSection, isSlug, parsePostFile } from '~~/server/utils/posts'

export default defineEventHandler(async (event) => {
  await requireInternal(event)

  const section = getRouterParam(event, 'section')
  const slug = getRouterParam(event, 'slug')
  if (!isSection(section) || !isSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid post path' })

  const file = await getFile(`content/${section}/${slug}.md`)
  return { ...parsePostFile(file.content), slug, sha: file.sha }
})
