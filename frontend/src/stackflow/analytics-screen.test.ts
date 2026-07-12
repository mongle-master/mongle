import { describe, expect, it } from 'vitest'
import { resolveAnalyticsScreen } from '@/stackflow/analytics-screen'

describe('resolveAnalyticsScreen', () => {
  it.each(['home', 'timeline', 'people', 'settings'])(
    'Main의 %s 탭을 화면명으로 사용한다',
    (tab) => {
      expect(resolveAnalyticsScreen('Main', { tab })).toBe(tab)
    },
  )

  it('Main의 알 수 없는 탭은 home으로 정규화한다', () => {
    expect(resolveAnalyticsScreen('Main', { tab: 'unknown' })).toBe('home')
  })

  it.each([
    ['Person', 'person_detail'],
    ['PersonNew', 'person_new'],
    ['PersonEdit', 'person_edit'],
    ['EventDetail', 'event_detail'],
    ['Record', 'record'],
    ['HomeSettings', 'home_settings'],
    ['TagSettings', 'tag_settings'],
    ['NotFound', 'not_found'],
    ['OnboardingName', 'onboarding_name'],
    ['OnboardingProfile', 'onboarding_profile'],
  ])('%s activity를 %s 화면명으로 정규화한다', (activityName, screen) => {
    expect(resolveAnalyticsScreen(activityName, {})).toBe(screen)
  })

  it('알 수 없는 activity는 수집하지 않는다', () => {
    expect(resolveAnalyticsScreen('Unknown', {})).toBeUndefined()
  })
})
