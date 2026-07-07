import { BottomNav } from '@/components/layout/bottom-nav'
import { cn } from '@/lib/utils'

export function AppShell({
  children,
  activePath,
  className,
  withNav = true,
}: {
  children: React.ReactNode
  activePath: string
  className?: string
  withNav?: boolean
}) {
  return (
    <div className="mx-auto min-h-dvh max-w-md bg-background">
      <main
        className={cn(
          'px-5 pt-[max(2.5rem,env(safe-area-inset-top))] pb-24',
          className,
        )}
      >
        {children}
      </main>
      {withNav ? <BottomNav activePath={activePath} /> : null}
    </div>
  )
}
