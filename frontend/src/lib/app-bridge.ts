// 앱 ↔ 웹 단방향(fire-and-forget) 네비게이션 브리지 — 웹 쪽. 설계 배경은 docs/how-tos/rn-stack-nav.md.
//
// ⚠️ AppBridgeMessage는 app/src/bridge/protocol.ts와 반드시 동일해야 한다(단일 소스).
//    모노레포 전까지 수동 동기화 대상 — 한쪽만 바뀌면 런타임에 조용히 깨진다.
export type AppBridgeMessage =
  | { type: 'STACK_PUSH'; url: string }
  | { type: 'STACK_BACK' }
  | { type: 'NAVIGATE_TAB'; path: string }

/** 네이티브 앱 WebView 내부인지 (app이 콘텐츠 로드 전 주입한 window 플래그) */
export function isInApp(): boolean {
  return typeof window !== 'undefined' && window.__MONGLE_APP__ === true
}

// 네이티브가 "탭"으로 여기는 경로 = 하단 네비(bottom-nav.tsx)의 목적지.
// 단일 홈 WebView 안에서 SPA로 오가는 화면들이며, 이 목록 밖은 전부 스택 상세로 취급한다.
// ⚠️ bottom-nav.tsx의 tabs와 일치해야 탭/스택 판정이 안 깨진다.
const TAB_PATHS = new Set(['/', '/timeline', '/record', '/people', '/settings'])

export function isTabPath(url: string): boolean {
  return TAB_PATHS.has(url.split('?')[0] ?? '')
}

export function isExternalUrl(url: string): boolean {
  return /^https?:\/\//.test(url)
}

// WebView 타입을 "로드된 순간의 경로"로 역추론한다(모듈 로드 시 1회). 이후 SPA 이동으로
// 경로가 바뀌어도 "나는 탭/스택 WebView"라는 정체성은 고정된다. (rn-stack-nav.md §7-1)
type WebViewType = 'tab' | 'stack'
const webViewType: WebViewType | null =
  typeof window !== 'undefined' && isInApp()
    ? isTabPath(window.location.pathname)
      ? 'tab'
      : 'stack'
    : null

export function isInStackWebView(): boolean {
  return webViewType === 'stack'
}

export function isInTabWebView(): boolean {
  return webViewType === 'tab'
}

function sendToApp(message: AppBridgeMessage): void {
  window.ReactNativeWebView?.postMessage(JSON.stringify(message))
}

export function stackPush(url: string): void {
  sendToApp({ type: 'STACK_PUSH', url })
}

export function stackBack(): void {
  sendToApp({ type: 'STACK_BACK' })
}

export function navigateTab(path: string): void {
  sendToApp({ type: 'NAVIGATE_TAB', path })
}
