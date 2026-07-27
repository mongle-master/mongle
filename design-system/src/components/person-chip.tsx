import type * as React from 'react'

import { cn } from '@/lib/utils'

import { Avatar } from './avatar'

/* voice-row/voice-icon-circular 문법 재사용 — 32px 원형 plate + 이름 */
function PersonChip({
  name,
  src,
  size = 'default',
  className,
  ...props
}: React.ComponentProps<'span'> & {
  name: string
  src?: string
  size?: 'sm' | 'default'
}) {
  return (
    <span
      data-slot="person-chip"
      className={cn(
        'inline-flex max-w-full items-center gap-2 rounded-pill border border-border bg-card py-1 pr-3 pl-1',
        className,
      )}
      {...props}
    >
      <Avatar fallback={name.slice(0, 1)} src={src} size={size === 'sm' ? 'sm' : 'default'} />
      <span className={cn('truncate text-foreground', size === 'sm' ? 'text-caption' : 'text-body-sm')}>
        {name}
      </span>
    </span>
  )
}

export { PersonChip }
