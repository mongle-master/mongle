import * as React from 'react'

import { cn } from '@/lib/utils'

function DiaryEntry({
  className,
  ...props
}: React.ComponentProps<'article'>) {
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

function DiaryEntryDate({
  className,
  ...props
}: React.ComponentProps<'time'>) {
  return (
    <time
      data-slot="diary-entry-date"
      className={cn('text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

function DiaryEntryBody({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="diary-entry-body"
      className={cn(
        'letter-paper font-hand text-[15px] leading-[28px] text-card-foreground',
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
      className={cn('flex items-center gap-2', className)}
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
