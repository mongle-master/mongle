import { cn } from '@/lib/utils'

// basic-ui 화면은 fixed가 아니라 가장 가까운 positioned 조상 기준 absolute다.
// 모바일은 기존 448px 앱 캔버스를 유지하고, PC에서는 넓은 앱 캔버스 안에서
// 좌측 내비게이션과 각 화면의 데스크톱 레이아웃을 함께 그린다.
export function StackViewport({
  children,
  desktop = false,
}: {
  children: React.ReactNode
  desktop?: boolean
}) {
  return (
    <div
      className={cn(
        'relative mx-auto h-dvh w-full max-w-md overflow-hidden bg-background sm:border-x sm:border-border',
        desktop &&
          'lg:max-w-[1440px] lg:shadow-[0_0_80px_rgba(0,0,0,0.06)] dark:lg:shadow-[0_0_80px_rgba(0,0,0,0.24)]',
      )}
    >
      {children}
      <div
        id="stack-overlay-root"
        className="pointer-events-none absolute inset-0 z-[70]"
      />
    </div>
  )
}
