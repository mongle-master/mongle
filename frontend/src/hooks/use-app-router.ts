import { useRouter } from '@tanstack/react-router'
import {
  isExternalUrl,
  isInApp,
  isInStackWebView,
  isInTabWebView,
  isTabPath,
  navigateTab,
  stackBack,
  stackPush,
} from '@/lib/app-bridge'

// 스택 WebView 내부의 웹 히스토리 depth. 모듈 스코프 = WebView 1개당 1개 카운터.
// 네이티브 스택 pop과 SPA 뒤로가기를 하나의 연속된 "뒤로" 경험으로 봉합한다. (rn-stack-nav.md §7-2)
let stackNavigationDepth = 0

/**
 * 앱/브라우저를 가리지 않는 네비게이션 훅. 항상 <Link> 대신 이걸(또는 AppLink) 쓴다.
 * push/back/toTab에 넘기는 값은 도메인 없는 상대 경로(예: '/people/1', '/record?eventId=5').
 */
export function useAppRouter() {
  const router = useRouter()
  const navigateToUrl = (url: string) => router.history.push(url)

  const push = (url: string) => {
    if (isExternalUrl(url)) {
      window.open(url, '_blank', 'noopener,noreferrer')
      return
    }

    if (isInStackWebView()) {
      // 스택 안에서 탭 경로로 → 네이티브가 스택을 걷고 탭 홈으로
      if (isTabPath(url)) {
        navigateTab(url)
        return
      }
      // 스택 안에서 일반 경로 → 같은 WebView 내 SPA 이동 (새 WebView는 무거우므로 재활용)
      stackNavigationDepth += 1
      navigateToUrl(url)
      return
    }

    // 탭 WebView에서 일반 경로 → 진짜 상세 → 네이티브 스택 push
    if (isInTabWebView() && !isTabPath(url)) {
      stackPush(url)
      return
    }

    // 탭 WebView에서 탭 경로(홈 내 SPA 이동) 또는 순수 웹(브라우저)
    navigateToUrl(url)
  }

  const back = () => {
    if (isInStackWebView()) {
      if (stackNavigationDepth > 0) {
        // 웹 히스토리부터 소진
        stackNavigationDepth -= 1
        router.history.back()
      } else {
        // 웹 depth 0 → 네이티브 스택 pop
        stackBack()
      }
      return
    }
    if (isInApp()) {
      stackBack() // 탭 WebView
      return
    }
    router.history.back() // 순수 웹
  }

  const toTab = (path: string) => {
    if (isInApp()) navigateTab(path)
    else navigateToUrl(path)
  }

  const openExternal = (url: string) =>
    window.open(url, '_blank', 'noopener,noreferrer')

  return { push, back, toTab, openExternal }
}
