import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'
import { Slot } from 'radix-ui'

import { cn } from '@/lib/utils'
import { coloredTagStyle } from '@/lib/relation-tag-colors'

// badge.tsx가 이 문자열 위에 cva를 얹는다(부품 합성 선례). 배지의 기존 시각을
// 고정하는 계약이라 값을 바꾸지 않는다. TagChip 자체는 아래 cva에서 높이·표면·
// 채움색을 축으로 분해해 재조립한다.
export const tagChipBaseClass =
  'inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent px-3.5 text-label leading-none font-bold whitespace-nowrap transition-colors'

const tagChipVariants = cva(
  'group/tag-chip inline-flex w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent leading-none whitespace-nowrap transition-colors',
  {
    variants: {
      // 실측된 높이 4단계 + 아바타 필터 pill(xl). 높이에 딸린 패딩·글자 크기·굵기가
      // 함께 움직여 한 축으로 묶는다.
      size: {
        xs: 'h-5 px-2 text-[10px] font-bold',
        sm: 'h-6 px-2 text-caption font-bold',
        default: 'h-7 px-3.5 text-label font-bold',
        lg: 'h-8 px-2.5 text-label font-bold',
        xl: 'h-9 w-auto max-w-full shrink justify-start px-1.5 pr-3 text-label font-extrabold',
      },
      // 쉬는 상태(비선택)의 표면색. selected면 tone이 이 색을 덮는다.
      surface: {
        card: 'border-border bg-card text-foreground',
        'card-muted': 'border-border bg-card text-muted-foreground',
        background: 'border-border bg-background text-foreground',
        soft: 'border-border/60 bg-background text-foreground',
        outline:
          'border-border/80 bg-background text-foreground hover:border-foreground/30 hover:bg-muted/60',
        plain: '',
      },
      // 선택 시 채움색. colored는 클래스 대신 color prop의 인라인 스타일로 칠한다.
      tone: {
        primary: '',
        foreground: '',
        colored: '',
      },
      // 비선택 상태의 표준 hover 어포던스.
      hover: {
        true: 'hover:bg-muted/40',
        false: '',
      },
      selected: {
        true: '',
        false: '',
      },
    },
    compoundVariants: [
      {
        selected: true,
        tone: 'primary',
        class: 'border-primary bg-primary text-primary-foreground',
      },
      {
        selected: true,
        tone: 'foreground',
        class: 'border-foreground bg-foreground text-background',
      },
      // 선택된 칩은 hover로 배경이 흔들리지 않아야 한다(원래 active 분기엔 hover가
      // 없었다). 선택 시 hover 색을 채움색으로 고정해 표면 hover를 무력화한다.
      {
        selected: true,
        tone: 'foreground',
        hover: true,
        class: 'hover:bg-foreground',
      },
      {
        selected: true,
        surface: 'outline',
        class: 'hover:border-foreground hover:bg-foreground',
      },
    ],
    defaultVariants: {
      size: 'default',
      surface: 'card',
      tone: 'primary',
      hover: false,
      selected: false,
    },
  },
)

// color는 폐기된 DOM presentational 속성(string)과 충돌하므로 제거하고, 태그
// 지정색(null 허용)으로 다시 정의한다.
type TagChipProps = Omit<React.ComponentProps<'button'>, 'color'> &
  VariantProps<typeof tagChipVariants> & {
    asChild?: boolean
    // 표시 전용(span). 기본은 인터랙티브 <button type="button">이며 aria-pressed를
    // 내장한다. 표시 전용일 땐 버튼 시맨틱·aria-pressed를 붙이지 않는다.
    interactive?: boolean
    // 태그 지정색. 있으면 coloredTagStyle을 인라인으로 주입해 표면/채움색을 덮는다.
    color?: string | null
  }

function TagChip({
  className,
  size,
  surface,
  tone,
  hover,
  selected = false,
  interactive = true,
  asChild = false,
  color,
  style,
  ...props
}: TagChipProps) {
  const Comp: React.ElementType = asChild
    ? Slot.Root
    : interactive
      ? 'button'
      : 'span'
  const isSelected = Boolean(selected)
  const coloredStyle = color ? coloredTagStyle(color, isSelected) : undefined
  const buttonProps =
    interactive && !asChild
      ? { type: 'button' as const, 'aria-pressed': isSelected }
      : {}

  return (
    <Comp
      data-slot="tag-chip"
      {...buttonProps}
      className={cn(
        tagChipVariants({ size, surface, tone, hover, selected }),
        className,
      )}
      style={coloredStyle ? { ...coloredStyle, ...style } : style}
      {...props}
    />
  )
}

export { TagChip, tagChipVariants }
