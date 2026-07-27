import type * as React from 'react'

import { cn } from '@/lib/utils'

// 감정 5가족 — 디자인 시스템(결)의 orb 파스텔과 1:1로 대응한다.
// 새 감정은 디자인 시스템 globals.css의 --emotion-* 부터 추가한다.
export type OrbEmotion = 'calm' | 'warm' | 'muse' | 'clear' | 'dear'

// 대기 orb — 감정 색의 장식 표현. aria-hidden 장식이며 콘텐츠를 담지 않는다.
// 크기·흐림·위치만 받아 어떤 화면에도 이식 가능하다. 색은 .orb[data-emotion]
// 셀렉터가 globals.css의 --emotion-* 토큰으로 결정한다 (테마 자동 반전).
export function Orb({
  emotion = 'calm',
  size = 160,
  animated = false,
  className,
  style,
  ...props
}: React.ComponentProps<'div'> & {
  emotion?: OrbEmotion
  size?: number
  animated?: boolean
}) {
  return (
    <div
      aria-hidden
      data-slot="orb"
      data-emotion={emotion}
      {...(animated ? { 'data-animated': '' } : {})}
      className={cn('orb absolute', className)}
      style={{ width: size, height: size, ...style }}
      {...props}
    />
  )
}
