import type { ComponentProps } from 'react'
import { cn } from '@/lib/utils'

export type ScrollBodyPad = 'tabbar' | 'screen' | 'none'

// pad별 하단 여백: 탭바가 겹치는 탭 화면(tabbar)·일반 화면 하단 여백(screen)·여백 없음(none).
const PAD_CLASS: Record<ScrollBodyPad, string> = {
  tabbar: 'pb-24',
  screen: 'pb-8',
  none: '',
}

// 세로 flex 셸(TabShell/ActivityShell fixed 레이아웃) 안에서 본문만 세로로 스크롤시키는 컨테이너.
// iOS 관성 스크롤과 스크롤바 자리(gutter) 예약을 함께 켜, 스크롤바가 나타날 때 본문 폭이 밀리지 않게 한다.
// 화면별 간격(space-y-* 등)은 컴포넌트에 굳히지 않고 className으로 넘긴다.
export function ScrollBody({
  pad = 'tabbar',
  className,
  ...props
}: ComponentProps<'div'> & { pad?: ScrollBodyPad }) {
  return (
    <div
      className={cn(
        'min-h-0 min-w-0 flex-1 overflow-y-auto [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]',
        PAD_CLASS[pad],
        className,
      )}
      {...props}
    />
  )
}
