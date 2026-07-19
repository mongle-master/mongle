import * as React from 'react'

import { cn } from '@/lib/utils'

// 빈 화면 안내(아이콘/제목/설명/액션)의 세로 중앙 정렬과 타이포를 부품이 소유한다.
// 아이콘·문구·버튼은 도메인이라 호출부가 children으로 조합한다(별도 아이콘 슬롯은 두지 않는다).
// 컨테이너 여백(py, flex-1 등)은 화면마다 달라 wrapper의 className(레이아웃 전용)으로 받는다.
function EmptyState({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state"
      className={cn('flex flex-col items-center text-center', className)}
      {...props}
    />
  )
}

function EmptyStateTitle({ className, ...props }: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-state-title"
      className={cn('text-body font-extrabold text-foreground', className)}
      {...props}
    />
  )
}

function EmptyStateDescription({
  className,
  ...props
}: React.ComponentProps<'p'>) {
  return (
    <p
      data-slot="empty-state-description"
      className={cn('text-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

// 액션(버튼)은 설명과의 간격 mt-4를 부품이 고정한다.
function EmptyStateAction({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="empty-state-action"
      className={cn('mt-4', className)}
      {...props}
    />
  )
}

export { EmptyState, EmptyStateTitle, EmptyStateDescription, EmptyStateAction }
