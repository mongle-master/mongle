import { defineConfig } from '@stackflow/config'
// ActivityDefinition에 `route` 필드를 추가하는 module augmentation을 활성화하기 위한 type-only import.
// (route는 @stackflow/config가 아니라 plugin-history-sync가 선언한다)
import type {} from '@stackflow/plugin-history-sync'

export const MAIN_TABS = ['home', 'timeline', 'people', 'settings'] as const
export type MainTab = (typeof MAIN_TABS)[number]

export type PersonView = 'profile' | 'timeline'

// history-sync가 URL을 거쳐 전달하는 값은 전부 string이므로
// activity params는 string(union) 기반으로 선언한다.
declare module '@stackflow/config' {
  interface Register {
    Main: { tab: MainTab }
    Person: { personId: string; view?: PersonView }
    PersonNew: object
    PersonEdit: { personId: string }
    EventDetail: { eventId: string }
    Record: { personId?: string; eventId?: string }
    NotFound: object
    // 온보딩 퍼널(인증 전 전용 스택, onboarding/onboarding-flow.tsx)의 activity.
    // Register는 전역 하나라 여기 함께 선언한다.
    OnboardingName: object
    OnboardingProfile: object
  }
}

export function isMainTab(value: string | undefined): value is MainTab {
  return MAIN_TABS.includes(value as MainTab)
}

// URL 생성(fill)은 해당 activity의 가장 구체적인 라우트 하나만 쓰므로
// activity당 라우트는 1개로 유지한다. 별칭이 필요하면 TSR 레벨 리다이렉트로 처리
// (`/` → `/home`은 routes/index.tsx, 구 `/people/:id/timeline`은 routes/people.$personId.timeline.tsx).
export const stackConfig = defineConfig({
  activities: [
    {
      name: 'Main',
      route: {
        // `/timeline`·`/people`·`/settings` 기존 URL이 그대로 탭 딥링크가 된다
        path: '/:tab',
        // 알 수 없는 탭 세그먼트는 홈으로 흡수한다 (decode throw 시 폴백 동작이 보장되지 않음)
        decode: (params) => ({
          tab: isMainTab(params.tab) ? params.tab : 'home',
        }),
      },
    },
    {
      name: 'Person',
      route: {
        path: '/people/:personId',
        // 딥링크로 바로 진입해도 뒤로가기가 앱 이탈이 아니라 탭 화면으로 떨어지게 한다
        defaultHistory: () => [
          { activityName: 'Main', activityParams: { tab: 'people' } },
        ],
      },
    },
    {
      name: 'PersonNew',
      route: {
        path: '/people/new',
        defaultHistory: () => [
          { activityName: 'Main', activityParams: { tab: 'people' } },
        ],
      },
    },
    {
      name: 'PersonEdit',
      route: {
        path: '/people/:personId/edit',
        defaultHistory: (params) => [
          { activityName: 'Main', activityParams: { tab: 'people' } },
          {
            activityName: 'Person',
            activityParams: { personId: params.personId },
          },
        ],
      },
    },
    {
      name: 'EventDetail',
      route: {
        path: '/events/:eventId',
        defaultHistory: () => [
          { activityName: 'Main', activityParams: { tab: 'timeline' } },
        ],
      },
    },
    {
      name: 'Record',
      route: {
        path: '/record',
        defaultHistory: () => [
          { activityName: 'Main', activityParams: { tab: 'home' } },
        ],
      },
    },
    {
      name: 'NotFound',
      route: '/404',
    },
  ],
  transitionDuration: 270,
  initialActivity: () => 'Main',
})
