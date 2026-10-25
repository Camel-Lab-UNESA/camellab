import { createError, defineEventHandler, getRouterParam, readBody } from 'h3'
import { requireInternal } from '~~/server/utils/admin'
import { getFile, putFile } from '~~/server/utils/github'
import { buildPostFile, isSection, isSlug, validatePost } from '~~/server/utils/posts'
import type { PostInput } from '~~/server/utils/posts'

type Body = Partial<PostInput> & { sha?: string }

export default defineEventHandler(async (event) => {
  await requireInternal(event)

  const section = getRouterParam(event, 'section')
  const slug = getRouterParam(event, 'slug')
  if (!isSection(section) || !isSlug(slug)) throw createError({ statusCode: 400, statusMessage: 'Invalid post path' })

  const body = await readBody<Body>(event)
  if (!body || typeof body !== 'object') throw createError({ statusCode: 400, statusMessage: 'Invalid body' })
  if (body.sha !== undefined && typeof body.sha !== 'string') throw createError({ statusCode: 400, statusMessage: 'Invalid sha' })

  const { sha, ...input } = body
  const errors = validatePost(input)
  if (errors.length) throw createError({ statusCode: 400, statusMessage: errors.join('; ') })

  const path = `content/${section}/${slug}.md`
  let existing: { sha: string } | undefined
  try {
    existing = await getFile(path)
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode !== 404) throw error
  }

  if (existing && !sha) throw createError({ statusCode: 409, statusMessage: 'This post changed. Reload before saving.' })
  if (existing && sha !== existing.sha) throw createError({ statusCode: 409, statusMessage: 'This post changed. Reload before saving.' })
  if (!existing && sha) throw createError({ statusCode: 409, statusMessage: 'This post no longer exists. Reload.' })

  const kind = section === 'news' ? 'news' : 'article'
  const action = existing ? 'update' : 'add'
  const result = await putFile(path, buildPostFile(input as PostInput), `content: ${action} ${kind} ${slug}`, existing?.sha)

  return { ...result, slug }
})
