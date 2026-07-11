import { createRouter as createTanStackRouter } from '@tanstack/react-router'
import { routeTree } from './routeTree.gen'
import { queryClient } from './lib/query-client'

export function getRouter() {
  const router = createTanStackRouter({
    routeTree,
    // 스크롤은 stackflow 화면(activity) 내부 컨테이너가 관리하므로
    // TSR의 window 스크롤 복원이 끼어들지 않게 한다.
    scrollRestoration: false,
    defaultPreload: 'intent',
    defaultPreloadStaleTime: 0,
    context: { queryClient },
  })

  return router
}

declare module '@tanstack/react-router' {
  interface Register {
    router: ReturnType<typeof getRouter>
  }
}
