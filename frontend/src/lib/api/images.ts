import { api } from '@/lib/api/client'
import { DUMMY_DATA_MODE, DummyModeError } from '@/lib/dummy-mode'

type StoredImage = { url: string }

export async function uploadImage(file: File) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  const formData = new FormData()
  formData.append('file', file)
  return api.post('v1/images', { body: formData }).json<StoredImage>()
}
