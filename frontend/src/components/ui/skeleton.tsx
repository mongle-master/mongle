import * as React from 'react'

import { cn } from '@/lib/utils'

// 로딩 중 콘텐츠 자리를 미리 잡아 레이아웃 점프를 막는 플레이스홀더.
// bg-muted 토큰을 써서 라이트/다크 테마를 그대로 타고, pulse로 살아있는 느낌을 준다.
// 크기·모양은 호출부가 className으로만 지정한다(한 파일 한 역할 원칙).
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
