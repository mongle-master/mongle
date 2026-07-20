import { describe, expect, it } from 'vitest'
import { activityUrl } from '@/stackflow/activity-url'

describe('activityUrl', () => {
  it.each([
    ['Main', { tab: 'home' }, '/home'],
    ['Person', { personId: '10' }, '/people/10'],
    [
      'Person',
      { personId: '10', view: 'timeline' },
      '/people/10?view=timeline',
    ],
    ['PersonNew', {}, '/people/new'],
    ['PersonEdit', { personId: '10' }, '/people/10/edit'],
    ['EventDetail', { eventId: '20' }, '/events/20'],
    ['Record', {}, '/record'],
    [
      'Record',
      { personId: '10', eventId: '20' },
      '/record?personId=10&eventId=20',
    ],
    ['HomeSettings', {}, '/settings/home'],
    ['TagSettings', {}, '/settings/tags'],
    ['NotFound', {}, '/404'],
  ] as const)(
    '%s activity를 상대 URL로 직렬화한다',
    (activityName, activityParams, expected) => {
      expect(activityUrl(activityName, activityParams)).toBe(expected)
    },
  )

  it('path parameter를 URL-safe하게 직렬화한다', () => {
    expect(activityUrl('Person', { personId: 'a/b' })).toBe('/people/a%2Fb')
  })

  it('기본 인물 view는 query string에서 생략한다', () => {
    expect(activityUrl('Person', { personId: '10', view: 'profile' })).toBe(
      '/people/10',
    )
  })
})
