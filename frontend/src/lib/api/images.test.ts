import { beforeEach, describe, expect, it, vi } from 'vitest'
import { uploadImage } from '@/lib/api/images'

const { uploadMock } = vi.hoisted(() => ({ uploadMock: vi.fn() }))

vi.mock('@vercel/blob/client', () => ({ upload: uploadMock }))

describe('uploadImage', () => {
  beforeEach(() => {
    vi.stubGlobal('localStorage', {
      getItem: (key: string) => (key === 'mongle_token' ? 'token' : null),
    })
    uploadMock.mockReset()
    uploadMock.mockResolvedValue({
      url: 'https://store.public.blob.vercel-storage.com/images/photo.jpg',
    })
  })

  it('인증 헤더로 Vercel Blob 직접 업로드를 요청한다', async () => {
    const file = { size: 5, type: 'image/jpeg' } as File

    await expect(uploadImage(file)).resolves.toEqual({
      url: 'https://store.public.blob.vercel-storage.com/images/photo.jpg',
    })
    expect(uploadMock).toHaveBeenCalledWith(
      expect.stringMatching(/^images\/.+\.jpg$/),
      file,
      {
        access: 'public',
        contentType: 'image/jpeg',
        handleUploadUrl: '/api/blob-upload',
        headers: { Authorization: 'Bearer token' },
      },
    )
  })

  it('지원하지 않는 형식과 10MB 초과 파일을 업로드 전에 거절한다', async () => {
    const gif = { size: 5, type: 'image/gif' } as File
    const oversized = {
      size: 10 * 1024 * 1024 + 1,
      type: 'image/png',
    } as File

    await expect(uploadImage(gif)).rejects.toThrow(
      'jpg·png·webp 이미지만 올릴 수 있어요.',
    )
    await expect(uploadImage(oversized)).rejects.toThrow(
      '이미지는 각 10MB 이하만 올릴 수 있어요.',
    )
    expect(uploadMock).not.toHaveBeenCalled()
  })
})
