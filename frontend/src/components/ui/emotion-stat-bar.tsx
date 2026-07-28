import * as React from 'react'

import { cn } from '@/lib/utils'

/**
 * EmotionStatBar — 감정 분포를 한 줄 막대 + 범례로 보여주는 표시 전용 부품.
 * 각 조각은 칩 color 로 칠해지며, 색이 없으면 중립 톤으로 떨어진다.
 * 막대는 장식(aria-hidden)이고, 범례 텍스트가 접근 가능한 정보를 담당한다.
 */
export type EmotionStatItem = {
  label: string
  color?: string | null
  count: number
}

function EmotionStatBar({
  items,
  className,
  ...props
}: React.ComponentProps<'div'> & {
  items: readonly EmotionStatItem[]
}) {
  const total = items.reduce((sum, item) => sum + Math.max(0, item.count), 0)

  return (
    <div
      data-slot="emotion-stat-bar"
      className={cn('flex flex-col gap-2', className)}
      {...props}
    >
      <div
        aria-hidden
        className="flex h-2.5 w-full overflow-hidden rounded-full bg-muted"
      >
        {total > 0 &&
          items.map((item, index) => {
            const ratio = Math.max(0, item.count) / total
            if (ratio <= 0) return null
            return (
              <span
                key={`${item.label}-${index}`}
                style={{
                  width: `${ratio * 100}%`,
                  backgroundColor: item.color ?? 'var(--border-strong)',
                }}
              />
            )
          })}
      </div>
      <ul className="flex flex-wrap gap-x-4 gap-y-1">
        {items.map((item, index) => (
          <li
            key={`${item.label}-${index}`}
            className="flex items-center gap-1.5 text-label text-muted-foreground"
          >
            <span
              aria-hidden
              className="size-2 shrink-0 rounded-full"
              style={{
                backgroundColor: item.color ?? 'var(--border-strong)',
              }}
            />
            <span className="font-medium text-foreground">{item.label}</span>
            <span>{item.count}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

export { EmotionStatBar }
