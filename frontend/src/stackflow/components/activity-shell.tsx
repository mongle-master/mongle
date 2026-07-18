import { AppScreen } from '@/stackflow/components/app-screen'
import { cn } from '@/lib/utils'

// push되는(탭 바 없는) activity의 공용 셸. 구 AppShell에서 BottomNav를 뺀 대응물.
// 화면이 컨테이너(absolute inset)에 갇히므로 dvh 대신 h-full 기준으로 잡는다.
export function ActivityShell({
  children,
  className,
  layout = 'default',
  presentation,
}: {
  children: React.ReactNode
  className?: string
  /** fixed: 헤더 고정 + 본문만 스크롤 (구 AppShell layout='fixed') */
  layout?: 'default' | 'fixed'
  /** modal: 아래에서 위로 뜨는 iOS present 전환 (기록 작성) */
  presentation?: 'modal'
}) {
  return (
    <AppScreen
      CUPERTINO_ONLY_modalPresentationStyle={
        presentation === 'modal' ? 'fullScreen' : undefined
      }
    >
      <div
        className={cn(
          'relative bg-background px-5 pt-[max(1.5rem,env(safe-area-inset-top))] lg:mx-auto lg:w-full lg:max-w-3xl lg:border-x lg:border-border/70 lg:px-10 lg:pt-8',
          layout === 'fixed'
            ? 'flex h-full min-h-0 min-w-0 flex-col overflow-hidden pb-[max(0.5rem,env(safe-area-inset-bottom))]'
            : 'h-full overflow-y-auto pb-8 [-webkit-overflow-scrolling:touch]',
          className,
        )}
      >
        {children}
      </div>
    </AppScreen>
  )
}
