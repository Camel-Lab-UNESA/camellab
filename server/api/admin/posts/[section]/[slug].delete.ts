import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireInternal } from '~~/server/utils/admin'
import { deleteFile, getFile } from '~~/server/utils/github'
import { isSection, isSlug } from '~~/server/utils/posts'

export default defineEventHandler(async (event) => {
  await requireInternal(event)

  const section = getRouterParam(event, 'section')
  const slug = getRouterParam(event, 'slug')
  if (!isSection(section) || !isSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid post path' })

  const body = await readBody<{ sha?: string }>(event)
  if (body?.sha !== undefined && typeof body.sha !== 'string') throw createError({ statusCode: 400, statusMessage: 'Invalid sha' })

  const path = `content/${section}/${slug}.md`
  const existing = await getFile(path)
  if (body?.sha && body.sha !== existing.sha) {
    throw createError({ statusCode: 409, statusMessage: 'This post changed. Reload before deleting.' })
  }

  const kind = section === 'news' ? 'news' : 'article'
  await deleteFile(path, `content: delete ${kind} ${slug}`, existing.sha)
  return { ok: true }
})
