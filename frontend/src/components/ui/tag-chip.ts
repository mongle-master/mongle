import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export const tagChipBaseClass =
  'inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent px-3.5 text-[13px] leading-none font-bold whitespace-nowrap transition-colors'

export const RELATION_TAG_COLOR_PALETTE = [
  '#E85D75',
  '#F97316',
  '#D97706',
  '#22A06B',
  '#0EA5E9',
  '#4F46E5',
  '#8B5CF6',
  '#DB2777',
] as const

const DEFAULT_TAG_COLOR = RELATION_TAG_COLOR_PALETTE[0]
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i

function hexToRgba(hex: string, alpha: number) {
  const normalized = HEX_COLOR_PATTERN.test(hex) ? hex : DEFAULT_TAG_COLOR
  const value = normalized.slice(1)
  const r = Number.parseInt(value.slice(0, 2), 16)
  const g = Number.parseInt(value.slice(2, 4), 16)
  const b = Number.parseInt(value.slice(4, 6), 16)
  return `rgba(${r}, ${g}, ${b}, ${alpha})`
}

export function normalizeChipColor(color?: string | null) {
  if (!color) return DEFAULT_TAG_COLOR
  return HEX_COLOR_PATTERN.test(color) ? color.toUpperCase() : DEFAULT_TAG_COLOR
}

export function coloredTagStyle(
  color?: string | null,
  active = false,
): CSSProperties {
  const normalized = normalizeChipColor(color)
  return {
    backgroundColor: active ? normalized : hexToRgba(normalized, 0.12),
    borderColor: active ? normalized : hexToRgba(normalized, 0.38),
    color: active ? '#FFFFFF' : normalized,
  }
}

export function tagChipClass(
  active: boolean,
  {
    activeClassName = 'border-primary bg-primary text-primary-foreground',
    inactiveClassName = 'border-border bg-card text-foreground',
    className,
  }: {
    activeClassName?: string
    inactiveClassName?: string
    className?: string
  } = {},
) {
  return cn(
    tagChipBaseClass,
    active ? activeClassName : inactiveClassName,
    className,
  )
}
