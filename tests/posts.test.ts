import assert from 'node:assert/strict'
import test from 'node:test'
import { slugify } from '../app/utils/slug.ts'
import { youtubeId } from '../app/utils/youtube.ts'
import { buildPostFile, isSection, isSlug, parsePostFile, validatePost } from '../server/utils/posts.ts'
import { imageExtension } from '../server/utils/uploads.ts'
import { visibleTo } from '../shared/utils/visibility.ts'
import type { PostInput } from '../server/utils/posts.ts'

const post: PostInput = {
  title: 'A "quoted" title: with colon',
  description: 'One line about the post.',
  date: '2026-10-25',
  author: 'Ada Lovelace',
  visibility: 'lecturers',
  body: '## Heading\n\nBody with **markdown**.\n'
}

test('front matter survives a build/parse round trip', () => {
  assert.deepEqual(parsePostFile(buildPostFile(post)), { ...post, body: post.body.trim() })
})

test('parse accepts CRLF and unquoted dates', () => {
  const raw = '---\r\ntitle: "Hello"\r\ndescription: "World"\r\ndate: 2026-01-02\r\nauthor: "Ada"\r\n---\r\n\r\nBody\r\n'
  assert.deepEqual(parsePostFile(raw), {
    title: 'Hello',
    description: 'World',
    date: '2026-01-02',
    author: 'Ada',
    visibility: 'public',
    body: 'Body'
  })
  assert.throws(() => parsePostFile('no front matter'))
})

test('validatePost rejects missing fields and bad dates', () => {
  assert.deepEqual(validatePost(post), [])
  assert.equal(validatePost({ ...post, title: ' ' }).length, 1)
  assert.equal(validatePost({ ...post, date: '2026-02-30' }).length, 1)
  assert.equal(validatePost({ ...post, description: undefined }).length, 1)
  assert.equal(validatePost({ ...post, title: 42 as unknown as string }).length, 1)
  assert.equal(validatePost({ ...post, visibility: 'everyone' as PostInput['visibility'] }).length, 1)
})

test('videos come only from YouTube links, not raw embeds', () => {
  for (const tag of ['<iframe src="https://evil.example">', '<VIDEO src="a.mp4">', '< script>', '<embed src="x">']) {
    assert.equal(validatePost({ ...post, body: `Hi\n\n${tag}` }).length, 1, tag)
  }
  assert.deepEqual(validatePost({ ...post, body: 'https://youtu.be/dQw4w9WgXcQ' }), [])
})

test('visibleTo: internal reads all, members posts need a sign-in, role posts need the role', () => {
  assert.deepEqual(visibleTo(undefined), ['public'])
  assert.deepEqual(visibleTo('student'), ['public', 'members', 'students'])
  assert.deepEqual(visibleTo('lecturer'), ['public', 'members', 'lecturers'])
  assert.deepEqual(visibleTo('internal'), ['public', 'members', 'students', 'lecturers', 'internal'])
  assert.deepEqual(visibleTo('someday-role'), ['public', 'members'])
})

test('youtubeId accepts YouTube video links only', () => {
  const id = 'dQw4w9WgXcQ'
  for (const url of [
    `https://www.youtube.com/watch?v=${id}&t=42s`,
    `https://youtube.com/watch?v=${id}`,
    `https://m.youtube.com/watch?v=${id}`,
    `https://youtu.be/${id}?si=abc`,
    `https://www.youtube.com/shorts/${id}`,
    `https://www.youtube.com/embed/${id}`,
    `https://www.youtube-nocookie.com/embed/${id}`
  ]) assert.equal(youtubeId(url), id, url)
  for (const url of [
    'https://vimeo.com/123456',
    `https://youtube.com.evil.example/watch?v=${id}`,
    `https://www.youtube.com/watch?v=${id}x`,
    'https://www.youtube.com/@channel',
    `javascript:alert(1)//youtu.be/${id}`,
    'not a url',
    undefined
  ]) assert.equal(youtubeId(url), null, String(url))
})

test('imageExtension trusts the bytes, not the name', () => {
  const bytes = (...values: (number | string)[]) => new Uint8Array(values.flatMap(v => typeof v === 'string' ? [...v].map(c => c.charCodeAt(0)) : [v]))
  assert.equal(imageExtension(bytes(0x89, 'PNG\r\n', 0x1A, '\n', 0)), 'png')
  assert.equal(imageExtension(bytes(0xFF, 0xD8, 0xFF, 0xE0)), 'jpg')
  assert.equal(imageExtension(bytes('GIF89a')), 'gif')
  assert.equal(imageExtension(bytes('RIFF', 0, 0, 0, 0, 'WEBPVP8 ')), 'webp')
  assert.equal(imageExtension(bytes('<svg xmlns="http://www.w3.org/2000/svg">')), undefined)
  assert.equal(imageExtension(bytes('<html>')), undefined)
})

test('slug and section validation', () => {
  assert.equal(isSlug('hello-world-2'), true)
  assert.equal(isSlug('Hello-World'), false)
  assert.equal(isSlug('-hello'), false)
  assert.equal(isSlug('a'.repeat(81)), false)
  assert.equal(isSection('news'), true)
  assert.equal(isSection('about'), false)
})

test('slugify strips accents and punctuation', () => {
  assert.equal(slugify('  Riset AI: Kecerdasan & Masa Depan!  '), 'riset-ai-kecerdasan-masa-depan')
})
