// 브라우저/OS는 뒤로·앞으로 제스처에 자체 전환(스냅샷 슬라이드)을 그린 뒤 popstate를
// 쏜다 — iOS Safari·iOS 17+ 설치형 PWA·안드로이드 예측형 뒤로가기·macOS 트랙패드 모두.
// 여기에 stackflow pop 전환(270ms)까지 겹치면 같은 이동이 두 번 미끄러져
// "페이지가 2벌" 보인다. 사용자 제스처(브라우저발) popstate 직후에만 잠깐 전환
// 시간을 0으로 눌러 이중 전환을 없앤다 (styles.css의 대응 규칙 참조).
//
// 판별은 소거법이다: 앱 내 pop도 history-sync가 URL 동기화를 위해 history.back()을
// 호출해 popstate를 만들므로, history.back/go/forward를 감싸 "앱이 만든 popstate"를
// 세어 두고 그 외의 popstate만 브라우저발로 간주한다. 시스템 전환이 없는 환경
// (예: 데스크톱 뒤로가기 버튼)에서는 즉시 전환이 브라우저 관례와 같아 부작용이 없다.
const SKIP_ATTR = 'data-browser-nav-transition-skip'

export function installBrowserNavTransitionSkip() {
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
