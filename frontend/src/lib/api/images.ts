import { upload } from '@vercel/blob/client'
import { getToken } from '@/lib/auth-token'

type StoredImage = { url: string }

const MAX_IMAGE_BYTES = 10 * 1024 * 1024
const EXTENSION_BY_CONTENT_TYPE: Record<string, string> = {
  'image/jpeg': 'jpg',
  'image/png': 'png',
  'image/webp': 'webp',
}

export async function uploadImage(file: File): Promise<StoredImage> {
  const extension = EXTENSION_BY_CONTENT_TYPE[file.type]
  if (!extension) {
    throw new Error('jpg·png·webp 이미지만 올릴 수 있어요.')
  }
  if (file.size > MAX_IMAGE_BYTES) {
    throw new Error('이미지는 각 10MB 이하만 올릴 수 있어요.')
  }

  const token = getToken()
  if (!token) throw new Error('로그인이 필요해요.')

  const blob = await upload(
    `images/${crypto.randomUUID()}.${extension}`,
    file,
    {
      access: 'public',
      contentType: file.type,
      handleUploadUrl: '/api/blob-upload',
      headers: { Authorization: `Bearer ${token}` },
    },
  )

  return { url: blob.url }
}
