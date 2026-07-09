import { BottomNav } from '@/components/layout/bottom-nav'
import { useApiFallbackStatus } from '@/lib/api/fallback-status'
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
  const fallbackActive = useApiFallbackStatus()

  return (
    <div
      className={cn(
        'mx-auto max-w-md bg-background',
        layout === 'fixed' ? 'flex h-dvh flex-col' : 'min-h-dvh',
      )}
    >
      <main
        className={cn(
          'px-5 pt-[max(1.5rem,env(safe-area-inset-top))]',
          layout === 'fixed'
            ? 'flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden pb-[calc(4.75rem+env(safe-area-inset-bottom))]'
            : 'pb-24',
          className,
        )}
      >
        {fallbackActive ? (
          <div className="mb-3 rounded-full border border-amber-500/30 bg-amber-500/10 px-3 py-1.5 text-center text-[11px] font-extrabold text-amber-700 dark:text-amber-300">
            목업 데이터 표시 중
          </div>
        ) : null}
        {children}
      </main>
      {withNav ? <BottomNav activePath={activePath} /> : null}
    </div>
  )
}
