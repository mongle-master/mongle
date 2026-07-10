import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@/stackflow/stackflow'

// /stack/** 의 URL 소유권은 stackflow(plugin-history-sync)에 있다.
// TSR은 이 splat 하나로 항상 매칭만 해주면 되고(라우트 컴포넌트가 리마운트되지 않도록
// 하위 경로 전부가 이 한 라우트여야 한다), 세부 경로 해석·push/pop은 stackflow가 한다.
export const Route = createFileRoute('/stack/$')({
  component: StackScreen,
})

function StackScreen() {
  return <Stack />
}
