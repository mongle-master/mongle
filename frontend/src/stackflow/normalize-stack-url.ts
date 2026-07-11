const LEGACY_PERSON_TIMELINE_PATH = /^\/people\/([^/]+)\/timeline\/?$/

// Stackflow가 history를 캡처하기 전에 URL 별칭을 canonical URL로 바꾼다.
// replaceState를 사용해 별칭 진입 자체는 브라우저 히스토리에 남기지 않는다.
export function normalizeStackUrl(): void {
  const url = new URL(window.location.href)

  if (url.pathname === '/') {
    url.pathname = '/home'
    window.history.replaceState(window.history.state, '', url)
    return
  }

  const legacyPersonTimeline = url.pathname.match(LEGACY_PERSON_TIMELINE_PATH)
  if (!legacyPersonTimeline) return

  url.pathname = `/people/${legacyPersonTimeline[1]}`
  url.searchParams.set('view', 'timeline')
  window.history.replaceState(window.history.state, '', url)
}
