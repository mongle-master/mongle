import * as React from 'react'

import { cn } from '@/lib/utils'

// 영역 구분선. 카드 안의 푸터 구분은 border-t를 직접 쓰는 게 나을 수 있고,
// 이 부품은 독립적인 수평/수직 구분이 필요할 때 쓴다.
function Separator({
  className,
  orientation = 'horizontal',
  ...props
}: React.ComponentProps<'div'> & {
  orientation?: 'horizontal' | 'vertical'
}) {
  return (
    <div
      data-slot="separator"
      role="separator"
      aria-orientation={orientation}
      className={cn(
        'shrink-0 bg-border',
        orientation === 'horizontal' ? 'h-px w-full' : 'h-full w-px',
        className,
      )}
      {...props}
    />
  )
}

export { Separator }
