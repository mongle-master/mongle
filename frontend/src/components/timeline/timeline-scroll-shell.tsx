import type { ReactNode, RefObject } from 'react'
import { AppShell } from '@/components/layout/app-shell'

export function TimelineScrollShell({
  activePath,
  header,
  scrollRef,
  children,
}: {
  activePath: string
  header: ReactNode
  scrollRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  return (
    <AppShell activePath={activePath} layout="fixed">
      <header className="shrink-0 pb-4">{header}</header>
      <div
        ref={scrollRef}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
      >
        {children}
      </div>
    </AppShell>
  )
}
