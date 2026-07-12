import { useEffect, useRef } from 'react'
import { AppScreen as BasicUIAppScreen } from '@stackflow/plugin-basic-ui'
import { useActivity } from '@stackflow/react'
import { trackScreenView } from '@/lib/analytics'
import { resolveAnalyticsScreen } from '@/stackflow/analytics-screen'

// basic-ui cupertino 테마의 인앱 엣지 스와이프백(20px 엣지 존)은 모바일 브라우저의
// 네이티브 뒤로가기 제스처 존과 정확히 겹친다. 브라우저는 제스처를 가로챌 때 페이지에
// touchstart~touchmove를 흘린 뒤 touchcancel을 보내는데, basic-ui(react-ui-core)는
// touchcancel을 touchend와 동일하게 완료로 판정해 pop()을 호출한다. 그 결과 네이티브
// 뒤로가기와 겹쳐 한 번의 스와이프에 화면이 두 개 pop된다(앱 밖까지 나가기도 함).
// 그래서 인앱 스와이프백을 전면 비활성하고, 엣지 스와이프는 네이티브 제스처
// (popstate + browser-nav-transition.ts의 전환 생략)에 위임한다. 헤더 ‹ 버튼 pop의
// 슬라이드 전환은 영향 없다. AppScreen은 basic-ui 원본 대신 반드시 이 래퍼를 쓴다.
export function AppScreen(
  props: React.ComponentProps<typeof BasicUIAppScreen>,
) {
  const activity = useActivity()
  const screen = resolveAnalyticsScreen(activity.name, activity.params)
  const lastTrackedScreen = useRef<string | null>(null)

  useEffect(() => {
    if (!activity.isActive) {
      lastTrackedScreen.current = null
      return
    }

    if (!screen || lastTrackedScreen.current === screen) return

    lastTrackedScreen.current = screen
    void trackScreenView(screen)
  }, [activity.isActive, screen])

  return <BasicUIAppScreen {...props} preventSwipeBack />
}
