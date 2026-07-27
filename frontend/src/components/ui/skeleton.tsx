import * as React from 'react'

import { cn } from '@/lib/utils'

// 로딩 자리 표시자. 실제 콘텐츠의 레이아웃을 그대로 차지해 로딩 중에도
// 화면이 흔들리지 않게 한다(레이아웃 유지가 목적).
function Skeleton({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="skeleton"
      className={cn('animate-pulse rounded-md bg-muted', className)}
      {...props}
    />
  )
}

export { Skeleton }
