import type { ReactNode, RefObject } from 'react'
import { ScrollBody } from '@/components/ui/scroll-body'

// 고정 헤더 + 내부 스크롤 본문. 바깥 셸(TabShell/ActivityShell의 fixed 레이아웃)이
// 세로 flex 컨테이너라는 전제로 동작한다.
// header 생략 시 헤더 슬롯 자체를 렌더하지 않는다 (Person activity처럼 헤더가 바깥에 있는 경우).
export function TimelineScrollShell({
  header,
  scrollRef,
  children,
}: {
  header?: ReactNode
  scrollRef: RefObject<HTMLDivElement | null>
  children: ReactNode
}) {
  return (
    <>
      {header !== undefined ? (
        <header className="shrink-0">{header}</header>
      ) : null}
      <ScrollBody ref={scrollRef} pad="tabbar">
        {children}
      </ScrollBody>
    </>
  )
}
