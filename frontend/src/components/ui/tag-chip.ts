import type { CSSProperties } from 'react'
import { cn } from '@/lib/utils'

export const tagChipBaseClass =
  'inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent px-3.5 text-[13px] leading-none font-bold whitespace-nowrap transition-colors'

export const RELATION_TAG_COLOR_OPTIONS = [
  { label: '로즈', value: '#E85D75' },
  { label: '코랄', value: '#F43F5E' },
  { label: '오렌지', value: '#F97316' },
  { label: '앰버', value: '#D97706' },
  { label: '라임', value: '#65A30D' },
  { label: '그린', value: '#22A06B' },
  { label: '민트', value: '#14B8A6' },
  { label: '스카이', value: '#0EA5E9' },
  { label: '블루', value: '#2563EB' },
  { label: '인디고', value: '#4F46E5' },
  { label: '바이올렛', value: '#8B5CF6' },
  { label: '퍼플', value: '#A855F7' },
  { label: '핑크', value: '#DB2777' },
  { label: '마젠타', value: '#C026D3' },
  { label: '슬레이트', value: '#475569' },
  { label: '스톤', value: '#78716C' },
] as const

export const RELATION_TAG_COLOR_PALETTE = [
  ...RELATION_TAG_COLOR_OPTIONS.map((option) => option.value),
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
