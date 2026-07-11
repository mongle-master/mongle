import { mediaUrl } from '@/lib/api/client'

export type ImageWidth = 64 | 128 | 256 | 640 | 1080 | 1920

export function optimizedImageUrl(
  path: string | null | undefined,
  width: ImageWidth,
): string | null {
  const source = mediaUrl(path)
  if (!source || !isVercelBlobUrl(source)) return source

  const params = new URLSearchParams({
    url: source,
    w: String(width),
    q: '80',
  })
  return `/_vercel/image?${params.toString()}`
}

function isVercelBlobUrl(source: string): boolean {
  try {
    const url = new URL(source)
    return (
      url.protocol === 'https:' &&
      url.hostname.endsWith('.public.blob.vercel-storage.com') &&
      url.pathname.startsWith('/images/')
    )
  } catch {
    return false
  }
}
