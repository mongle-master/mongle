import type * as React from 'react'

import { cn } from '@/lib/utils'

/* 감사 일기 목록: 세리프 번호 + hairline 구분. 상자 대신 선 (design.md). */
function GratitudeList({
  items,
  className,
  ...props
}: React.ComponentProps<'ol'> & { items: string[] }) {
  return (
    <ol data-slot="gratitude-list" className={cn('flex flex-col', className)} {...props}>
      {items.map((item, index) => (
        <li
          key={`${index}-${item}`}
          className={cn(
            'flex items-baseline gap-4 py-3.5',
            index > 0 && 'border-t border-border',
          )}
        >
          <span
            aria-hidden
            className="w-6 shrink-0 text-right font-display text-display-sm leading-none text-muted-foreground/70"
          >
            {index + 1}
          </span>
          <span className="text-body-md leading-relaxed text-foreground">{item}</span>
        </li>
      ))}
    </ol>
  )
}

export { GratitudeList }
