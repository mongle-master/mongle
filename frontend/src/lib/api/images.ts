import { api } from '@/lib/api/client'

type StoredImage = { url: string }

export async function uploadImage(file: File) {
  const formData = new FormData()
  formData.append('file', file)
  return api.post('v1/images', { body: formData }).json<StoredImage>()
}
