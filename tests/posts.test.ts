import assert from 'node:assert/strict'
import test from 'node:test'
import { slugify } from '../app/utils/slug.ts'
import { buildPostFile, isSection, isSlug, parsePostFile, validatePost } from '../server/utils/posts.ts'

const post = {
  title: 'A "quoted" title: with colon',
  description: 'One line about the post.',
  date: '2026-10-25',
  author: 'Ada Lovelace',
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
