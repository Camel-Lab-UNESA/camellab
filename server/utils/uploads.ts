// Images committed with posts. Raster formats only: an SVG can carry script.
export const UPLOAD_DIR = 'public/uploads'
// Vercel rejects request bodies over 4.5 MB.
export const MAX_UPLOAD_BYTES = 4 * 1024 * 1024

export const IMAGE_TYPES: Record<string, string> = {
  png: 'image/png',
  jpg: 'image/jpeg',
  gif: 'image/gif',
  webp: 'image/webp'
}

// Trust the file's bytes, not its name or the browser's content type.
export function imageExtension(data: Uint8Array): string | undefined {
  const ascii = (start: number, end: number) => String.fromCharCode(...data.subarray(start, end))
  if (ascii(0, 8) === '\x89PNG\r\n\x1A\n') return 'png'
  if (data[0] === 0xFF && data[1] === 0xD8 && data[2] === 0xFF) return 'jpg'
  if (ascii(0, 4) === 'GIF8') return 'gif'
  if (ascii(0, 4) === 'RIFF' && ascii(8, 12) === 'WEBP') return 'webp'
}
