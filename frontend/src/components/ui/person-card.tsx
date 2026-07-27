import * as React from 'react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'

// 주변인 기록 카드. 아바타(이니셜) + 이름 + 관계 설명의 가로 행.
// 목록에서 반복 사용되므로 간격·말줄임을 부품이 소유한다.

function PersonCard({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="person-card"
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card p-3',
        className,
      )}
      {...props}
    />
  )
}

// 이름의 첫 글자를 이니셜로 쓴다. 이미지가 있으면 호출부가 AvatarImage를 조합.
function PersonCardAvatar({
  name,
  className,
  ...props
}: React.ComponentProps<typeof Avatar> & { name: string }) {
  return (
    <Avatar size="lg" className={className} {...props}>
      <AvatarFallback className="text-label font-bold">
        {name.charAt(0)}
      </AvatarFallback>
    </Avatar>
  )
}

function PersonCardInfo({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="person-card-info"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  )
}

function PersonCardName({ className, ...props }: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="person-card-name"
      className={cn(
        'truncate text-body font-medium text-card-foreground',
        className,
      )}
      {...props}
    />
  )
}

function PersonCardRelation({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="person-card-relation"
      className={cn('truncate text-caption text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  PersonCard,
  PersonCardAvatar,
  PersonCardInfo,
  PersonCardName,
  PersonCardRelation,
}
