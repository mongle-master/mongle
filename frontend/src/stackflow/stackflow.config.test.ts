import { beforeEach, describe, expect, it } from 'vitest'
import { stackConfig } from '@/stackflow/stackflow.config'

const DETAIL_ACTIVITY_NAMES = [
  'Person',
  'PersonNew',
  'PersonEdit',
  'EventDetail',
  'Record',
  'HomeSettings',
  'TagSettings',
] as const

type DefaultHistoryRoute = {
  defaultHistory: (params: Record<string, string>) => unknown[]
}

function defaultHistory(activityName: (typeof DETAIL_ACTIVITY_NAMES)[number]) {
  const activity = stackConfig.activities.find(
    (candidate) => candidate.name === activityName,
  )
  if (!activity || typeof activity.route === 'string') {
    throw new Error(`${activityName} route를 찾을 수 없습니다.`)
  }

  return (activity.route as DefaultHistoryRoute).defaultHistory({
    personId: '10',
  })
}

describe('stackConfig defaultHistory', () => {
  beforeEach(() => {
    delete window.__MONGLE_NATIVE_NAVIGATION__
    delete window.ReactNativeWebView
  })

  it('모바일 웹에서는 상세 화면 아래의 복귀 history를 유지한다', () => {
    expect(defaultHistory('Person')).toHaveLength(1)
    expect(defaultHistory('PersonNew')).toHaveLength(1)
    expect(defaultHistory('PersonEdit')).toHaveLength(2)
    expect(defaultHistory('EventDetail')).toHaveLength(1)
    expect(defaultHistory('Record')).toHaveLength(1)
    expect(defaultHistory('HomeSettings')).toHaveLength(1)
    expect(defaultHistory('TagSettings')).toHaveLength(1)
  })

  it('네이티브 flag만 있고 bridge가 없으면 상세 history를 유지한다', () => {
    window.__MONGLE_NATIVE_NAVIGATION__ = true

    expect(defaultHistory('Person')).toHaveLength(1)
  })

  it.each(DETAIL_ACTIVITY_NAMES)(
    '네이티브 웹뷰에서는 %s 아래에 Stackflow history를 만들지 않는다',
    (activityName) => {
      window.__MONGLE_NATIVE_NAVIGATION__ = true
      window.ReactNativeWebView = { postMessage: () => undefined }

      expect(defaultHistory(activityName)).toEqual([])
    },
  )
})
