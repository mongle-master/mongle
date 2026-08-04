export type HomeView = 'orbit' | 'list'

/** PRD: 마지막에 고른 보기를 기억해 다음에 그대로 보여준다. 기본은 궤도. */
export const HOME_VIEW_STORAGE_KEY = 'mongle:home-view:v1'

export function getHomeView(): HomeView {
  try {
    return localStorage.getItem(HOME_VIEW_STORAGE_KEY) === 'list'
      ? 'list'
      : 'orbit'
  } catch {
    // private browsing 등
    return 'orbit'
  }
}

export function setHomeView(view: HomeView) {
  try {
    localStorage.setItem(HOME_VIEW_STORAGE_KEY, view)
  } catch {
    // ignore
  }
}
