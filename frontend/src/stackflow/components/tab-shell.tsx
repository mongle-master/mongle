import { cn } from '@/lib/utils'

// Main activity의 탭 슬롯 안에서 쓰는 공용 셸. 구 AppShell의 main 영역 대응물로,
// 하단은 StackTabBar(오버레이)를 피할 만큼 패딩을 준다.
// 탭마다 이 셸이 각자 스크롤 컨테이너를 가지므로 탭 전환 시 스크롤 위치도 보존된다.
export function TabShell({
  children,
  className,
  layout = 'default',
}: {
  children: React.ReactNode
  className?: string
  /** fixed: 헤더 고정 + 본문만 스크롤 (구 AppShell layout='fixed') */
  layout?: 'default' | 'fixed'
}) {
  return (
    <div
      className={cn(
        'px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(4.75rem+env(safe-area-inset-bottom))]',
        layout === 'fixed'
          ? 'flex h-full min-h-0 min-w-0 flex-col overflow-hidden'
          : 'h-full overflow-y-auto [-webkit-overflow-scrolling:touch]',
        className,
      )}
    >
      {children}
    </div>
  )
}
