import { render } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { AppScreen } from '@/stackflow/components/app-screen'

const mocks = vi.hoisted(() => ({
  activity: {
    name: 'Main',
    params: { tab: 'home' },
    isActive: true,
  },
  trackScreenView: vi.fn().mockResolvedValue(undefined),
}))

vi.mock('@stackflow/react', () => ({
  useActivity: () => mocks.activity,
}))

vi.mock('@stackflow/plugin-basic-ui', () => ({
  AppScreen: ({ children }: { children?: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))

vi.mock('@/lib/analytics', () => ({
  trackScreenView: mocks.trackScreenView,
}))

describe('AppScreen analytics', () => {
  beforeEach(() => {
    mocks.activity.name = 'Main'
    mocks.activity.params = { tab: 'home' }
    mocks.activity.isActive = true
    mocks.trackScreenView.mockClear()
  })

  it('활성 화면과 탭 변경을 한 번씩 수집한다', () => {
    const screen = () => <AppScreen>화면</AppScreen>
    const { rerender } = render(screen())

    expect(mocks.trackScreenView).toHaveBeenCalledWith('home')

    rerender(screen())
    expect(mocks.trackScreenView).toHaveBeenCalledTimes(1)

    mocks.activity.params = { tab: 'timeline' }
    rerender(screen())

    expect(mocks.trackScreenView).toHaveBeenLastCalledWith('timeline')
    expect(mocks.trackScreenView).toHaveBeenCalledTimes(2)
  })

  it('pop으로 다시 활성화된 화면을 재수집한다', () => {
    const screen = () => <AppScreen>화면</AppScreen>
    const { rerender } = render(screen())

    mocks.activity.isActive = false
    rerender(screen())

    mocks.activity.isActive = true
    rerender(screen())

    expect(mocks.trackScreenView).toHaveBeenCalledTimes(2)
    expect(mocks.trackScreenView).toHaveBeenLastCalledWith('home')
  })
})
