import { beforeEach, describe, expect, it, vi } from 'vitest'
import { ensureAnonymousAuth } from '@/lib/api/auth'

const mocks = vi.hoisted(() => ({
  getOrCreateAnonymousId: vi.fn(),
  getToken: vi.fn(),
  post: vi.fn(),
  setToken: vi.fn(),
}))

vi.mock('@/lib/anonymous-session', () => ({
  getOrCreateAnonymousId: mocks.getOrCreateAnonymousId,
}))

vi.mock('@/lib/auth-token', () => ({
  getToken: mocks.getToken,
  setToken: mocks.setToken,
}))

vi.mock('@/lib/api/client', () => ({
  api: { post: mocks.post },
}))

describe('ensureAnonymousAuth', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('keeps the existing token without replacing the browser identity', async () => {
    mocks.getToken.mockReturnValue('existing-token')

    await ensureAnonymousAuth()

    expect(mocks.getOrCreateAnonymousId).not.toHaveBeenCalled()
    expect(mocks.post).not.toHaveBeenCalled()
    expect(mocks.setToken).not.toHaveBeenCalled()
  })

  it('creates an account with the persisted browser UUID when no token exists', async () => {
    const json = vi.fn().mockResolvedValue({ token: 'new-token' })
    mocks.getToken.mockReturnValue(null)
    mocks.getOrCreateAnonymousId.mockReturnValue(
      '8c9ce952-82f9-42f0-b908-4165ba6d89c1',
    )
    mocks.post.mockReturnValue({ json })

    await ensureAnonymousAuth()

    expect(mocks.post).toHaveBeenCalledWith('v1/auth/token', {
      json: { username: '8c9ce952-82f9-42f0-b908-4165ba6d89c1' },
    })
    expect(mocks.setToken).toHaveBeenCalledWith('new-token')
  })
})
