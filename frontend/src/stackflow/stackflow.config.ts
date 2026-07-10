import { defineConfig } from '@stackflow/config'
// ActivityDefinition에 `route` 필드를 추가하는 module augmentation을 활성화하기 위한 type-only import.
// (route는 @stackflow/config가 아니라 plugin-history-sync가 선언한다)
import type {} from '@stackflow/plugin-history-sync'

// 지금은 기존 TSR 라우트와 URL 소유권이 겹치지 않도록 전부 /stack 아래에 둔다.
// 화면 이전이 끝나면 이 프리픽스를 제거하고 TSR 라우트를 삭제하는 것이 컷오버다.
export const STACK_PREFIX = '/stack'

export const MAIN_TABS = ['home', 'timeline', 'people', 'settings'] as const
export type MainTab = (typeof MAIN_TABS)[number]

export type PersonView = 'profile' | 'timeline'

// history-sync가 URL을 거쳐 전달하는 값은 전부 string이므로
// activity params는 string(union) 기반으로 선언한다.
declare module '@stackflow/config' {
  interface Register {
    Main: { tab: MainTab }
    Person: { personId: string; view?: PersonView }
    EventDetail: { eventId: string }
    Record: { personId?: string; eventId?: string }
    NotFound: object
  }
}

function isMainTab(value: string | undefined): value is MainTab {
  return MAIN_TABS.includes(value as MainTab)
}

export const stackConfig = defineConfig({
  activities: [
    {
      name: 'Main',
      route: {
        path: `${STACK_PREFIX}/:tab`,
        // 알 수 없는 탭 세그먼트는 홈으로 흡수한다 (throw 시 폴백 동작이 보장되지 않음)
        decode: (params) => ({
          tab: isMainTab(params.tab) ? params.tab : 'home',
        }),
      },
    },
    {
      name: 'Person',
      route: {
        path: `${STACK_PREFIX}/people/:personId`,
        // 딥링크로 바로 진입해도 뒤로가기가 앱 이탈이 아니라 사람 탭으로 떨어지게 한다
        defaultHistory: () => [
          { activityName: 'Main', activityParams: { tab: 'people' } },
        ],
      },
    },
    {
      name: 'EventDetail',
      route: {
        path: `${STACK_PREFIX}/events/:eventId`,
        defaultHistory: () => [
          { activityName: 'Main', activityParams: { tab: 'timeline' } },
        ],
      },
    },
    {
      name: 'Record',
      route: {
        path: `${STACK_PREFIX}/record`,
        defaultHistory: () => [
          { activityName: 'Main', activityParams: { tab: 'home' } },
        ],
      },
    },
    {
      name: 'NotFound',
      route: `${STACK_PREFIX}/404`,
    },
  ],
  transitionDuration: 270,
  initialActivity: () => 'Main',
})
