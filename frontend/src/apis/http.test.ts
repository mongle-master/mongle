import { beforeEach, describe, expect, it, vi } from 'vitest'
import { kyAxiosAdapter } from '@/apis/http'

const { apiMock } = vi.hoisted(() => ({ apiMock: vi.fn() }))

vi.mock('@/lib/api/client', () => ({ api: apiMock }))

describe('kyAxiosAdapter', () => {
  beforeEach(() => {
    apiMock.mockReset()
  })

  it('OpenAPI 경로와 배열 query parameter를 ky 요청으로 변환한다', async () => {
    const text = vi.fn().mockResolvedValue('{"groups":[]}')
    apiMock.mockResolvedValue({ status: 200, text })

    await expect(
      kyAxiosAdapter({
        url: '/api/v1/timeline',
        method: 'GET',
        params: { categoryChipIds: [1, 2], personIds: [7] },
      }),
    ).resolves.toEqual({ groups: [] })

    const [path, options] = apiMock.mock.calls[0]
    expect(path).toBe('v1/timeline')
    expect(options.searchParams.toString()).toBe(
      'categoryChipIds=1&categoryChipIds=2&personIds=7',
    )
  })

  it.each([200, 204, 205])(
    '%i 빈 응답을 undefined로 반환한다',
    async (status) => {
      const text = vi.fn().mockResolvedValue('')
      apiMock.mockResolvedValue({ status, text })

      await expect(
        kyAxiosAdapter({ url: '/api/v1/users/me', method: 'DELETE' }),
      ).resolves.toBeUndefined()
      if (status === 200) expect(text).toHaveBeenCalledOnce()
      else expect(text).not.toHaveBeenCalled()
    },
  )
})
