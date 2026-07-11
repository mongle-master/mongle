import type { ReactNode, RefObject } from 'react'

// 고정 헤더 + 내부 스크롤 본문. 바깥 셸(TabShell/ActivityShell의 fixed 레이아웃)이
// 세로 flex 컨테이너라는 전제로 동작한다.
export function TimelineScrollShell({
  header,
  scrollRef,
  children,
}: {
  header: ReactNode
  scrollRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  return (
    <>
      <header className="shrink-0 pb-4">{header}</header>
      <div
        ref={scrollRef}
        className="min-h-0 min-w-0 flex-1 overflow-y-auto pt-1 pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]"
      >
        {children}
      </div>
    </>
  )
}
