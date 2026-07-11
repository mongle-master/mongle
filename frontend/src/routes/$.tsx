import { createFileRoute } from '@tanstack/react-router'
import { Stack } from '@/stackflow/stackflow'

// 모든 화면 URL의 소유권은 stackflow(plugin-history-sync)에 있다.
// TSR은 이 splat 하나로 항상 매칭만 해주면 되고(모든 스택 URL이 이 한 라우트여야
// <Stack/>이 리마운트되지 않는다), 세부 경로 해석·push/pop은 stackflow가 한다.
export const Route = createFileRoute('/$')({
  component: StackScreen,
})

function StackScreen() {
  // PC에서도 모바일 폭(max-w-md) 안에서만 화면이 그려지고 슬라이드되도록
  // 스택 전체를 가운데 정렬된 컨테이너에 가둔다.
  // (basic-ui 화면은 fixed가 아니라 가장 가까운 positioned 조상 기준 absolute)
  return (
    <div className="relative mx-auto h-dvh w-full max-w-md overflow-hidden bg-background sm:border-x sm:border-border">
      <Stack />
    </div>
  )
}
