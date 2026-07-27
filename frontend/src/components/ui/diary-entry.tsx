import * as React from 'react'

import { cn } from '@/lib/utils'

// 일기 항목 카드. 본문은 편지지 괘선(letter-paper) + 손글씨 폰트로 종이에 쓴
// 느낌을 준다. 날짜·감정·본문·꼬리말을 역할별 하위 부품으로 조합한다.

function DiaryEntry({ className, ...props }: React.ComponentProps<'article'>) {
  return (
    <article
      data-slot="diary-entry"
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-4',
        className,
      )}
      {...props}
    />
  )
}

function DiaryEntryHeader({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="diary-entry-header"
      className={cn('flex items-center justify-between gap-2', className)}
      {...props}
    />
  )
}

function DiaryEntryDate({ className, ...props }: React.ComponentProps<'time'>) {
  return (
    <time
      data-slot="diary-entry-date"
      className={cn('text-caption text-muted-foreground', className)}
      {...props}
    />
  )
}

// 본문: 괘선 배경의 line-height(28px)와 손글씨 폰트를 부품이 고정한다.
function DiaryEntryBody({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="diary-entry-body"
      className={cn(
        'letter-paper font-hand text-body leading-[28px] text-card-foreground',
        className,
      )}
      {...props}
    />
  )
}

function DiaryEntryFooter({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="diary-entry-footer"
      className={cn('flex flex-wrap items-center gap-2', className)}
      {...props}
    />
  )
}

export {
  DiaryEntry,
  DiaryEntryHeader,
  DiaryEntryDate,
  DiaryEntryBody,
  DiaryEntryFooter,
}
