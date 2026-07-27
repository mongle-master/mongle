import type * as React from 'react'

import { cn } from '@/lib/utils'

import type { Emotion } from './emotions'

/* 대기 orb — 감정 색의 장식 표현. aria-hidden 장식이며 콘텐츠를 담지 않는다.
   크기·흐림만 받아 어떤 화면에도 이식 가능 (playbook C-3). */
function Orb({
  emotion = 'calm',
  size = 160,
  animated = false,
  className,
  style,
  ...props
}: React.ComponentProps<'div'> & {
  emotion?: Emotion
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

export { Orb }
