import { createHash } from 'node:crypto'
import { mkdir, readdir, readFile, unlink, writeFile } from 'node:fs/promises'
import { dirname } from 'node:path'
import { createError } from 'h3'

const API = 'https://api.github.com'

// In dev, files are read from and written to the working tree (content/, public/uploads/): the dev
// server picks them up at once, and test posts never reach the branch Vercel deploys.
const LOCAL = import.meta.dev

// The sha GitHub reports for a file, so the stale-edit checks work the same locally.
function blobSha(content: string | Buffer): string {
  return createHash('sha1').update(`blob ${Buffer.byteLength(content)}\0`).update(content).digest('hex')
}

function isMissing(error: unknown): boolean {
  return (error as NodeJS.ErrnoException).code === 'ENOENT'
}

async function readLocal(path: string): Promise<Buffer> {
  try {
    return await readFile(path)
  } catch (error) {
    if (isMissing(error)) throw createError({ statusCode: 404, statusMessage: 'Not found' })
    throw error
  }
}

type GithubFile = {
  name: string
  sha: string
  type: string
  content?: string
  encoding?: string
}

type GithubWrite = {
  content: { sha: string }
  commit: { sha: string, html_url: string }
}

function required(name: string): string {
  const value = process.env[name]
  if (!value) throw createError({ statusCode: 500, statusMessage: `Missing ${name}` })
  return value
}

function branch(): string {
  return process.env.GITHUB_BRANCH || 'main'
}

function contentsUrl(path: string): string {
  const repo = required('GITHUB_REPO')
  const encoded = path.split('/').map(encodeURIComponent).join('/')
  return `${API}/repos/${repo}/contents/${encoded}`
}

async function call(url: string, init: RequestInit = {}): Promise<Response> {
  const response = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${required('GITHUB_TOKEN')}`,
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      'User-Agent': 'camellab',
      ...init.headers
    }
  })

  if (!response.ok) {
    const detail = (await response.text()).slice(0, 180)
    const statusCode = response.status === 404
      ? 404
      : response.status === 409
        ? 409
        : response.status === 429
          ? 429
          : response.status === 422
            ? 400
            : 502
    throw createError({ statusCode, statusMessage: `GitHub ${response.status}: ${detail}` })
  }

  return response
}

async function request<T>(url: string, init: RequestInit = {}): Promise<T> {
  return (await call(url, init)).json() as Promise<T>
}

export async function listFiles(path: string): Promise<{ slug: string, sha: string }[]> {
  if (LOCAL) {
    const names = await readdir(path).catch((error) => {
      if (isMissing(error)) return []
      throw error
    })
    return Promise.all(names.filter(name => name.endsWith('.md')).map(async name => ({
      slug: name.slice(0, -3),
      sha: blobSha(await readFile(`${path}/${name}`, 'utf8'))
    })))
  }

  try {
    const files = await request<GithubFile[]>(`${contentsUrl(path)}?ref=${encodeURIComponent(branch())}`)
    return files
      .filter(file => file.type === 'file' && file.name.endsWith('.md'))
      .map(file => ({ slug: file.name.slice(0, -3), sha: file.sha }))
  } catch (error) {
    if ((error as { statusCode?: number }).statusCode === 404) return []
    throw error
  }
}

export async function getFile(path: string): Promise<{ content: string, sha: string }> {
  if (LOCAL) {
    const content = (await readLocal(path)).toString('utf8')
    return { content, sha: blobSha(content) }
  }

  const file = await request<GithubFile>(`${contentsUrl(path)}?ref=${encodeURIComponent(branch())}`)
  if (!file.content) throw createError({ statusCode: 502, statusMessage: 'GitHub returned no file content' })
  return {
    content: Buffer.from(file.content, 'base64').toString('utf8'),
    sha: file.sha
  }
}

// Any size up to GitHub's 100 MB limit; getFile only returns text files under 1 MB.
export async function getRawFile(path: string): Promise<Buffer> {
  if (LOCAL) return readLocal(path)

  const response = await call(`${contentsUrl(path)}?ref=${encodeURIComponent(branch())}`, {
    headers: { Accept: 'application/vnd.github.raw+json' }
  })
  return Buffer.from(await response.arrayBuffer())
}

export async function putFile(path: string, content: string | Buffer, message: string, sha?: string) {
  if (LOCAL) {
    await mkdir(dirname(path), { recursive: true })
    await writeFile(path, content)
    return { contentSha: blobSha(content), commitUrl: '' }
  }

  const body = {
    message,
    content: (typeof content === 'string' ? Buffer.from(content) : content).toString('base64'),
    branch: branch(),
    ...(sha ? { sha } : {})
  }
  const result = await request<GithubWrite>(contentsUrl(path), {
    method: 'PUT',
    body: JSON.stringify(body)
  })
  return { contentSha: result.content.sha, commitUrl: result.commit.html_url }
}

export async function deleteFile(path: string, message: string, sha: string) {
  if (LOCAL) return unlink(path)

  await request(contentsUrl(path), {
    method: 'DELETE',
    body: JSON.stringify({ message, sha, branch: branch() })
  })
}
