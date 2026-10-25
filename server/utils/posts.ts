export const SECTIONS = ['news', 'articles'] as const

export type Section = (typeof SECTIONS)[number]
export type PostInput = {
  title: string
  description: string
  date: string
  author: string
  body: string
}

export function isSection(value: unknown): value is Section {
  return typeof value === 'string' && (SECTIONS as readonly string[]).includes(value)
}

export function isSlug(value: unknown): value is string {
  return typeof value === 'string' && value.length <= 80 && /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(value)
}

function isDate(value: unknown): value is string {
  if (typeof value !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false
  const date = new Date(`${value}T00:00:00Z`)
  return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value
}

function isText(value: unknown, max: number): value is string {
  return typeof value === 'string' && value.trim().length > 0 && value.length <= max
}

export function validatePost(input: Partial<PostInput>): string[] {
  const errors: string[] = []
  if (!isText(input.title, 200)) errors.push('title must be 1-200 characters')
  if (!isText(input.description, 300)) errors.push('description must be 1-300 characters')
  if (!isDate(input.date)) errors.push('date must be a valid YYYY-MM-DD date')
  if (!isText(input.author, 100)) errors.push('author must be 1-100 characters')
  if (!isText(input.body, 500_000)) errors.push('body must be 1-500000 characters')
  return errors
}

export function buildPostFile(post: PostInput): string {
  return [
    '---',
    `title: ${JSON.stringify(post.title)}`,
    `description: ${JSON.stringify(post.description)}`,
    `date: ${post.date}`,
    `author: ${JSON.stringify(post.author)}`,
    '---',
    '',
    post.body.trim(),
    ''
  ].join('\n')
}

export function parsePostFile(raw: string): PostInput {
  const match = /^---\r?\n([\s\S]*?)\r?\n---(?:\r?\n|$)([\s\S]*)$/.exec(raw)
  if (!match) throw new Error('Missing front matter')

  const fields: Record<string, string> = {}
  for (const line of match[1].split(/\r?\n/)) {
    const colon = line.indexOf(':')
    if (colon === -1) continue
    const key = line.slice(0, colon).trim()
    const rawValue = line.slice(colon + 1).trim()
    if (!key) continue
    fields[key] = rawValue.startsWith('"') || rawValue.startsWith("'")
      ? parseQuoted(rawValue)
      : rawValue
  }

  return {
    title: fields.title ?? '',
    description: fields.description ?? '',
    date: fields.date ?? '',
    author: fields.author ?? '',
    body: match[2].trim()
  }
}

function parseQuoted(value: string): string {
  try {
    return JSON.parse(value)
  } catch {
    return value.slice(1, -1)
  }
}
