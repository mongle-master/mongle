// iOS Safari(브라우저 탭)에서는 뒤로/앞으로 엣지 스와이프에 브라우저가 자체 스냅샷
// 전환을 그린 뒤 popstate를 쏜다. 여기에 stackflow pop 전환(270ms)까지 겹치면
// 같은 이동이 두 번 미끄러져 "페이지가 2벌" 보인다. 사용자 제스처(브라우저발)로
// 들어온 popstate 직후에만 잠깐 전환 시간을 0으로 눌러 이중 전환을 없앤다
// (styles.css의 대응 규칙 참조).
//
// 주의: 앱 내 pop(뒤로가기 버튼 등)도 history-sync가 URL 동기화를 위해
// history.back()을 호출해 popstate를 발생시킨다. 이건 브라우저 전환이 없으므로
// stackflow 애니메이션을 유지해야 한다 — history.back/go/forward를 감싸서
// "앱이 스스로 만든 popstate"를 세어 구분한다.
//
// 설치형(PWA standalone)은 브라우저 제스처 UI가 없으므로 아무것도 하지 않는다.
const SKIP_ATTR = 'data-browser-nav-transition-skip'

export function installBrowserNavTransitionSkip() {
  // iOS 전 브라우저(전부 WebKit) + macOS Safari(트랙패드 스와이프도 스냅샷 전환을 그림).
  // Chrome/Firefox 등은 vendor가 다르므로 제외된다.
  const isAppleBrowser = navigator.vendor === 'Apple Computer, Inc.'
  const isStandalone =
    window.matchMedia('(display-mode: standalone)').matches ||
    ('standalone' in window.navigator &&
      (window.navigator as { standalone?: boolean }).standalone === true)
  if (!isAppleBrowser || isStandalone) return

  let pendingAppNavigations = 0
  let decayTimer: number | undefined

  const countAppNavigation = () => {
    pendingAppNavigations += 1
    // popstate가 오지 않는 호출(go(0) 등)로 카운터가 새는 것을 방지
    window.clearTimeout(decayTimer)
    decayTimer = window.setTimeout(() => {
      pendingAppNavigations = 0
    }, 500)
  }

  const originalGo = window.history.go.bind(window.history)
  const originalBack = window.history.back.bind(window.history)
  const originalForward = window.history.forward.bind(window.history)
  window.history.go = (delta?: number) => {
    if (delta) countAppNavigation()
    originalGo(delta)
  }
  window.history.back = () => {
    countAppNavigation()
    originalBack()
  }
  window.history.forward = () => {
    countAppNavigation()
    originalForward()
  }

  let removeTimer: number | undefined
  window.addEventListener(
    'popstate',
    () => {
      if (pendingAppNavigations > 0) {
        pendingAppNavigations -= 1
        return
      }
      document.documentElement.setAttribute(SKIP_ATTR, '')
      window.clearTimeout(removeTimer)
      // stackflow transitionDuration(270ms)보다 넉넉히 길게 유지 후 해제
      removeTimer = window.setTimeout(() => {
        document.documentElement.removeAttribute(SKIP_ATTR)
      }, 400)
    },
    // history-sync의 리스너보다 먼저 돌도록 capture 단계에서 잡는다
    true,
  )
}
