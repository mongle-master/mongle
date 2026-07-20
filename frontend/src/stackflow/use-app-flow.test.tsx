import { act, renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useAppFlow } from '@/stackflow/use-app-flow'

const flow = vi.hoisted(() => ({
  push: vi.fn(() => ({ activityId: 'web-push' })),
  replace: vi.fn(() => ({ activityId: 'web-replace' })),
  pop: vi.fn(),
}))

vi.mock('@stackflow/react', () => ({
  useFlow: () => flow,
}))

describe('useAppFlow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    delete window.__MONGLE_NATIVE_NAVIGATION__
    delete window.ReactNativeWebView
  })

  it('모바일 웹에서는 Stackflow action을 그대로 사용한다', () => {
    const { result } = renderHook(() => useAppFlow())

    act(() => result.current.push('Person', { personId: '10' }))

    expect(flow.push).toHaveBeenCalledWith('Person', { personId: '10' })
  })

  it('네이티브 flag만 있고 postMessage가 없으면 Stackflow로 폴백한다', () => {
    window.__MONGLE_NATIVE_NAVIGATION__ = true
    const { result } = renderHook(() => useAppFlow())

    act(() => result.current.push('Person', { personId: '10' }))

    expect(flow.push).toHaveBeenCalledWith('Person', { personId: '10' })
  })

  it('웹뷰에서는 push와 replace를 RN stack message로 위임한다', () => {
    const postMessage = vi.fn()
    window.__MONGLE_NATIVE_NAVIGATION__ = true
    window.ReactNativeWebView = { postMessage }
    const { result } = renderHook(() => useAppFlow())

    act(() => {
      result.current.push('Person', { personId: '10' })
      result.current.replace('Record', { eventId: '20' })
    })

    expect(flow.push).not.toHaveBeenCalled()
    expect(flow.replace).not.toHaveBeenCalled()
    expect(postMessage).toHaveBeenNthCalledWith(
      1,
      JSON.stringify({ type: 'STACK_PUSH', url: '/people/10' }),
    )
    expect(postMessage).toHaveBeenNthCalledWith(
      2,
      JSON.stringify({ type: 'STACK_REPLACE', url: '/record?eventId=20' }),
    )
  })

  it('웹뷰에서는 pop count를 RN stack message로 전달한다', () => {
    const postMessage = vi.fn()
    window.__MONGLE_NATIVE_NAVIGATION__ = true
    window.ReactNativeWebView = { postMessage }
    const { result } = renderHook(() => useAppFlow())

    act(() => result.current.pop(2))

    expect(flow.pop).not.toHaveBeenCalled()
    expect(postMessage).toHaveBeenCalledWith(
      JSON.stringify({ type: 'STACK_POP', count: 2 }),
    )
  })
})
