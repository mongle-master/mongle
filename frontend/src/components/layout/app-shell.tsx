import { BottomNav } from '@/components/layout/bottom-nav'
import { cn } from '@/lib/utils'

export function AppShell({
  children,
  activePath,
  className,
  withNav = true,
  layout = 'default',
}: {
  children: React.ReactNode
  activePath: string
  className?: string
  withNav?: boolean
  /** fixed: 헤더 고정 + 본문만 스크롤 (타임라인 탭 등) */
  layout?: 'default' | 'fixed'
}) {
  return (
    <div
      className={cn(
        'mx-auto max-w-md bg-background',
        layout === 'fixed' ? 'flex h-dvh flex-col' : 'min-h-dvh',
      )}
    >
      <main
        className={cn(
          'px-5 pt-[max(2.5rem,env(safe-area-inset-top))]',
          layout === 'fixed'
            ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-0'
            : 'pb-24',
          className,
        )}
      >
        {children}
      </main>
      {withNav ? <BottomNav activePath={activePath} /> : null}
    </div>
  )
}
