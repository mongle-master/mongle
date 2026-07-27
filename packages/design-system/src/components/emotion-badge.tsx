import * as React from 'react'
import { cva } from 'class-variance-authority'
import type { VariantProps } from 'class-variance-authority'

import { cn } from '@/lib/utils'

const emotionBadgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-medium transition-colors',
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

const emotionLabels: Record<string, string> = {
  joy: '기쁨',
  calm: '평온',
  sadness: '슬픔',
  anger: '분노',
  anxiety: '불안',
  gratitude: '감사',
}

const emotionDots: Record<string, string> = {
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
  return (
    <span
      data-slot="emotion-badge"
      data-emotion={emotion}
      className={cn(emotionBadgeVariants({ emotion }), className)}
      {...props}
    >
      {showDot && (
        <span
          className={cn('size-1.5 rounded-full', emotionDots[emotion ?? 'joy'])}
          aria-hidden
        />
      )}
      {children ?? emotionLabels[emotion ?? 'joy']}
    </span>
  )
}

export { EmotionBadge, emotionBadgeVariants, emotionLabels }
