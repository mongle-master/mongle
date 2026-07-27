import type * as React from 'react'

import { cn } from '@/lib/utils'

import { EMOTION_LABELS, type Emotion } from './emotions'
import { Orb } from './orb'

/* 1년 전 오늘 회고 — 레퍼런스 testimonial-card 문법 + orb 대기.
   Day One의 On This Day가 증명한 "과거 기록의 자동 서페이싱" 순간. */
function OnThisDayCard({
  originalDate,
  quote,
  emotion = 'warm',
  className,
  ...props
}: React.ComponentProps<'figure'> & {
  originalDate: string
  quote: string
  emotion?: Emotion
}) {
  return (
    <figure
      data-slot="on-this-day-card"
      className={cn(
        'relative overflow-hidden rounded-2xl border border-border bg-card p-8 text-card-foreground',
        className,
      )}
      {...props}
    >
      <Orb emotion={emotion} size={220} className="-top-16 -right-16" />
      <figcaption className="eyebrow relative">1년 전 오늘 · {originalDate}</figcaption>
      <blockquote className="relative mt-4 font-display text-display-sm leading-snug font-normal text-foreground">
        “{quote}”
      </blockquote>
      <p className="relative mt-4 text-caption text-muted-foreground">
        그때의 감정 · {EMOTION_LABELS[emotion]}
      </p>
    </figure>
  )
}

export { OnThisDayCard }
