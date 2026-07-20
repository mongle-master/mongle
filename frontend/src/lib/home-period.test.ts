import { beforeEach, describe, expect, it, vi } from 'vitest'
import {
  HOME_PERIOD_STORAGE_KEY,
  getDefaultHomePeriod,
  refreshDefaultHomePeriod,
  setDefaultHomePeriod,
  subscribeDefaultHomePeriod,
} from './home-period'

describe('home default period', () => {
  beforeEach(() => {
    localStorage.clear()
  })

  it('persists and reads the default period', () => {
    setDefaultHomePeriod('1Y')

    expect(localStorage.getItem(HOME_PERIOD_STORAGE_KEY)).toBe('1Y')
    expect(getDefaultHomePeriod()).toBe('1Y')
  })

  it('falls back to ALL when nothing is stored or value is malformed', () => {
    expect(getDefaultHomePeriod()).toBe('ALL')

    localStorage.setItem(HOME_PERIOD_STORAGE_KEY, '10Y')
    expect(getDefaultHomePeriod()).toBe('ALL')
  })

  it('notifies subscribers when the default period changes', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeDefaultHomePeriod(listener)

    setDefaultHomePeriod('3Y')
    expect(listener).toHaveBeenCalledWith('3Y')

    unsubscribe()
    setDefaultHomePeriod('1M')
    expect(listener).toHaveBeenCalledTimes(1)
  })

  it('다른 WebView가 저장한 기본 기간을 현재 구독자에게 다시 전달한다', () => {
    const listener = vi.fn()
    const unsubscribe = subscribeDefaultHomePeriod(listener)
    localStorage.setItem(HOME_PERIOD_STORAGE_KEY, '5Y')

    refreshDefaultHomePeriod()

    expect(listener).toHaveBeenCalledWith('5Y')
    unsubscribe()
  })
})
