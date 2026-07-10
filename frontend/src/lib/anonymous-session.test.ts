import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getOrCreateAnonymousId } from '@/lib/anonymous-session'

describe('getOrCreateAnonymousId', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  afterEach(() => {
    vi.restoreAllMocks()
  })

  it('creates and stores a UUID for a new browser session', () => {
    const randomUUID = vi
      .spyOn(crypto, 'randomUUID')
      .mockReturnValue('8c9ce952-82f9-42f0-b908-4165ba6d89c1')

    expect(getOrCreateAnonymousId()).toBe(
      '8c9ce952-82f9-42f0-b908-4165ba6d89c1',
    )
    expect(localStorage.getItem('mongle_anonymous_id')).toBe(
      '8c9ce952-82f9-42f0-b908-4165ba6d89c1',
    )
    expect(randomUUID).toHaveBeenCalledOnce()
  })

  it('reuses the stored UUID without creating a new one', () => {
    localStorage.setItem(
      'mongle_anonymous_id',
      '3af976a8-b106-4081-832d-67bb8e18bdc4',
    )
    const randomUUID = vi.spyOn(crypto, 'randomUUID')

    expect(getOrCreateAnonymousId()).toBe(
      '3af976a8-b106-4081-832d-67bb8e18bdc4',
    )
    expect(randomUUID).not.toHaveBeenCalled()
  })
})
