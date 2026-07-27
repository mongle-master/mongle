import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

// 감정 일기의 6가지 감정. 색은 토큰 정본(styles.css)의 --emotion-* 쌍을 쓴다.
// fg(--emotion-joy)와 bg(--emotion-joy-bg)가 한 쌍이라 테마가 바뀌어도 대비가 산다.
export type Emotion =
  'joy' | 'calm' | 'sadness' | 'anger' | 'anxiety' | 'gratitude'

const emotionBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-caption font-bold whitespace-nowrap transition-colors',
  {
    variants: {
      emotion: {
        joy: 'bg-emotion-joy-bg text-emotion-joy',
        calm: 'bg-emotion-calm-bg text-emotion-calm',
        sadness: 'bg-emotion-sadness-bg text-emotion-sadness',
        anger: 'bg-emotion-anger-bg text-emotion-anger',
        anxiety: 'bg-emotion-anxiety-bg text-emotion-anxiety',
        gratitude: 'bg-emotion-gratitude-bg text-emotion-gratitude',
      },
    },
    defaultVariants: {
      emotion: 'joy',
    },
  },
)

export const emotionLabels: Record<Emotion, string> = {
  joy: '기쁨',
  calm: '평온',
  sadness: '슬픔',
  anger: '분노',
  anxiety: '불안',
  gratitude: '감사',
}

const emotionDotClass: Record<Emotion, string> = {
  joy: 'bg-emotion-joy',
  calm: 'bg-emotion-calm',
  sadness: 'bg-emotion-sadness',
  anger: 'bg-emotion-anger',
  anxiety: 'bg-emotion-anxiety',
  gratitude: 'bg-emotion-gratitude',
}

function EmotionBadge({
  className,
  emotion = 'joy',
  showDot = true,
  children,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof emotionBadgeVariants> & {
    showDot?: boolean
  }) {
  const key = emotion ?? 'joy'

  return (
    <span
      data-slot="emotion-badge"
      data-emotion={key}
      className={cn(emotionBadgeVariants({ emotion: key }), className)}
      {...props}
    >
      {showDot && (
        <span
          data-slot="emotion-badge-dot"
          className={cn('size-1.5 rounded-full', emotionDotClass[key])}
          aria-hidden
        />
      )}
      {children ?? emotionLabels[key]}
    </span>
  )
}

export { EmotionBadge, emotionBadgeVariants }
