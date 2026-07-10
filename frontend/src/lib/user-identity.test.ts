import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createUserIdentity, getUserIdentity } from './user-identity'

const USER_ID = '8e0ca8f5-a713-4a90-9df1-15f0be0d843c'

describe('user identity', () => {
  beforeEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('creates and persists a UUID identity', () => {
    vi.spyOn(crypto, 'randomUUID').mockReturnValue(USER_ID)

    expect(createUserIdentity('  성빈  ')).toEqual({
      userId: USER_ID,
      username: '성빈',
    })
    expect(getUserIdentity()).toEqual({ userId: USER_ID, username: '성빈' })
  })

  it('ignores malformed local storage data', () => {
    localStorage.setItem('mongle_user_identity', '{')

    expect(getUserIdentity()).toBeNull()
  })
})
