import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@/stackflow/stackflow'
import { StackViewport } from '@/stackflow/components/stack-viewport'

// 모든 화면 URL의 소유권은 stackflow(plugin-history-sync)에 있다.
// TSR은 이 splat 하나로 항상 매칭만 해주면 되고(모든 스택 URL이 이 한 라우트여야
// <Stack/>이 리마운트되지 않는다), 세부 경로 해석·push/pop은 stackflow가 한다.
export const Route = createFileRoute('/$')({
  component: StackScreen,
})

function StackScreen() {
  return (
    <StackViewport>
      <Stack />
    </StackViewport>
  )
}
