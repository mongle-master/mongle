import { createFileRoute, redirect } from '@tanstack/react-router'

// history-sync의 URL 생성이 Main의 `/:tab` 라우트를 쓰므로 `/` 자체는 스택 라우트가 아니다.
// 루트 진입만 TSR 레벨에서 홈 탭 URL로 넘긴다.
export const Route = createFileRoute('/')({
  beforeLoad: () => {
    throw redirect({ to: '/$', params: { _splat: 'home' }, replace: true })
  },
})
