import { createFileRoute, redirect } from '@tanstack/react-router'

// /stack 진입점. 스택 화면은 전부 splat(stack.$.tsx) 한 라우트 안에서만 살아야
// TSR 라우트 전환에 의한 <Stack/> 리마운트가 없으므로, 여기서는 렌더 없이 넘긴다.
export const Route = createFileRoute('/stack/')({
  beforeLoad: () => {
    throw redirect({ to: '/stack/$', params: { _splat: 'home' } })
  },
})
