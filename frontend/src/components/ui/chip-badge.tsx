import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { TagChip } from '@/components/ui/tag-chip'
import type { tagChipVariants } from '@/components/ui/tag-chip'

/**
 * ChipBadge — 칩(감정·카테고리·날씨·관계태그)의 표시 전용 색상 배지.
 * 칩은 per-chip hex color 를 가지므로, 색이 있으면 TagChip 의 colored 톤으로
 * 표면 위 색 염색(Gyeol 규칙)을 그린다. 색이 없으면 중립 surface 로 떨어진다.
 *
 * ui 레이어는 API 를 모르도록 ChipRef 가 아니라 구조적 타입만 받는다
 * (ChipRef = { id, label, color } 가 구조 호환되어 그대로 넘길 수 있다).
 */
export type ChipBadgeChip = {
  label: string
  color?: string | null
}

type ChipBadgeProps = Omit<React.ComponentProps<'span'>, 'color' | 'ref'> &
  Pick<VariantProps<typeof tagChipVariants>, 'size'> & {
    chip: ChipBadgeChip
    /** 색 점이 필요한지. 감정/카테고리는 기본 on, 촘촘한 관계태그 표시는 off. */
    showDot?: boolean
  }

function ChipBadge({
  chip,
  size,
  showDot = true,
  className,
  ...props
}: ChipBadgeProps) {
  return (
    <TagChip
      interactive={false}
      size={size}
      surface={chip.color ? 'plain' : 'card-muted'}
      tone="colored"
      color={chip.color ?? null}
      className={cn('cursor-default', className)}
      {...props}
    >
      {showDot && chip.color && (
        <span
          aria-hidden
          className="size-1.5 shrink-0 rounded-full"
          style={{ backgroundColor: chip.color }}
        />
      )}
      {chip.label}
    </TagChip>
  )
}

export { ChipBadge }
