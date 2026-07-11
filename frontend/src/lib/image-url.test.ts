import { describe, expect, it } from 'vitest'
import { optimizedImageUrl } from '@/lib/image-url'

describe('optimizedImageUrl', () => {
  it('Vercel Blob 이미지를 지정한 너비로 최적화한다', () => {
    const source =
      'https://store.public.blob.vercel-storage.com/images/photo-random.jpg'

    expect(optimizedImageUrl(source, 640)).toBe(
      `/_vercel/image?url=${encodeURIComponent(source)}&w=640&q=80`,
    )
  })

  it('기존 절대 URL과 로컬 이미지는 그대로 유지한다', () => {
    const legacy = 'https://example.supabase.co/storage/image.jpg'

    expect(optimizedImageUrl(legacy, 640)).toBe(legacy)
    expect(optimizedImageUrl('/default-people/person.png', 128)).toBe(
      '/default-people/person.png',
    )
  })
})
