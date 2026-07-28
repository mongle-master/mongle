import * as React from 'react'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'
import { TagChip } from '@/components/ui/tag-chip'
import type { tagChipVariants } from '@/components/ui/tag-chip'

/**
 * ChipPicker — 칩 목록에서의 단일/다중 선택 프리미티브.
 * 감정(다중)·카테고리(단일)·관계태그(다중) 선택을 하나로 통합한다.
 * 각 칩은 per-chip color 로 Gyeol 색 염색을 그리며, 선택 시 채워진다.
 * ui 레이어는 API 를 모르도록 구조적 타입만 받는다(ChipResponse 가 구조 호환).
 */
export type ChipPickerChip = {
  id: number
  label: string
  color?: string | null
  /** 개인 칩이면 라벨이 PII 라 data-amp-mask 를 붙인다(기존 선택 UI 관행 유지). */
  personal?: boolean
}

type ChipPickerValue = number | number[]

type ChipPickerProps = Omit<React.ComponentProps<'div'>, 'onChange'> &
  Pick<VariantProps<typeof tagChipVariants>, 'size'> & {
    chips: readonly ChipPickerChip[]
    value?: ChipPickerValue
    onValueChange?: (value: ChipPickerValue) => void
    multiple?: boolean
    /** personal 여부와 무관하게 모든 칩 라벨을 마스킹(보기 화면의 보수적 관행). */
    maskAll?: boolean
    ariaLabel?: string
  }

function toArray(value: ChipPickerValue | undefined): number[] {
  if (value == null) return []
  return Array.isArray(value) ? value : [value]
}

function ChipPicker({
  chips,
  value,
  onValueChange,
  multiple = false,
  maskAll = false,
  size,
  ariaLabel,
  className,
  ...props
}: ChipPickerProps) {
  const selected = toArray(value)

  const toggle = (id: number) => {
    if (multiple) {
      const next = selected.includes(id)
        ? selected.filter((item) => item !== id)
        : [...selected, id]
      onValueChange?.(next)
      return
    }
    onValueChange?.(id)
  }

  return (
    <div
      data-slot="chip-picker"
      role="group"
      aria-label={ariaLabel}
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    >
      {chips.map((chip) => (
        <TagChip
          key={chip.id}
          size={size}
          tone="colored"
          surface={chip.color ? 'plain' : 'outline'}
          hover
          color={chip.color ?? null}
          selected={selected.includes(chip.id)}
          data-amp-mask={maskAll || chip.personal || undefined}
          onClick={() => toggle(chip.id)}
        >
          {chip.color && (
            <span
              aria-hidden
              className="size-1.5 shrink-0 rounded-full"
              style={{ backgroundColor: chip.color }}
            />
          )}
          {chip.label}
        </TagChip>
      ))}
    </div>
  )
}

export { ChipPicker }
