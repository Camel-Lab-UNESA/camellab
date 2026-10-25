import { createError, defineEventHandler, getQuery } from 'h3'
import { requireInternal } from '~~/server/utils/admin'
import { getFile, listFiles } from '~~/server/utils/github'
import { isSection, parsePostFile } from '~~/server/utils/posts'

export default defineEventHandler(async (event) => {
  await requireInternal(event)

  const section = getQuery(event).section
  if (!isSection(section)) throw createError({ statusCode: 400, statusMessage: 'Unknown section' })

  const files = await listFiles(`content/${section}`)
  const posts = await Promise.all(files.map(async (file) => {
    try {
      const { content } = await getFile(`content/${section}/${file.slug}.md`)
      const post = parsePostFile(content)
      return { ...file, title: post.title, date: post.date, visibility: post.visibility }
    } catch {
      return { ...file, title: file.slug, date: '', visibility: 'public' }
    }
  }))

  return posts.sort((a, b) => b.date.localeCompare(a.date))
})
