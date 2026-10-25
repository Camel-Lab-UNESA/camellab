// The video id in a YouTube watch, share, shorts, live or embed link; null for anything else.
export function youtubeId(url: unknown): string | null {
  if (typeof url !== 'string') return null
  let parsed: URL
  try {
    parsed = new URL(url)
  } catch {
    return null
  }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') return null

  const host = parsed.hostname.replace(/^(?:www|m)\./, '')
  const id = host === 'youtu.be'
    ? parsed.pathname.slice(1)
    : host === 'youtube.com' || host === 'youtube-nocookie.com'
      ? parsed.pathname === '/watch'
        ? parsed.searchParams.get('v')
        : /^\/(?:embed|shorts|live)\/([^/]+)/.exec(parsed.pathname)?.[1]
      : null
  return id && /^[\w-]{11}$/.test(id) ? id : null
}
