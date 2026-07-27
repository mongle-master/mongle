import type * as React from 'react'

import { cn } from '@/lib/utils'

import { EMOTIONS, EMOTION_LABELS, type Emotion } from './emotions'

const dotClass: Record<Emotion, string> = {
  calm: 'bg-emotion-calm',
  warm: 'bg-emotion-warm',
  muse: 'bg-emotion-muse',
  clear: 'bg-emotion-clear',
  dear: 'bg-emotion-dear',
}

/* Daylio식 감정 선택. 색 점 + 라벨을 반드시 함께 보여 색만으로 구분하지 않는다. */
function EmotionPicker({
  value,
  onChange,
  className,
  ...props
}: Omit<React.ComponentProps<'div'>, 'onChange'> & {
  value: Emotion | null
  onChange: (emotion: Emotion) => void
}) {
  return (
    <div
      role="radiogroup"
      aria-label="감정 선택"
      data-slot="emotion-picker"
      className={cn('flex flex-wrap gap-2', className)}
      {...props}
    >
      {EMOTIONS.map((emotion) => {
        const selected = value === emotion
        return (
          <button
            key={emotion}
            type="button"
            role="radio"
            aria-checked={selected}
            data-emotion={emotion}
            onClick={() => onChange(emotion)}
            className={cn(
              'inline-flex items-center gap-2 rounded-pill border px-3.5 py-2 text-body-sm font-medium transition-colors',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60',
              selected
                ? 'border-foreground bg-card text-foreground shadow-card'
                : 'border-border bg-transparent text-muted-foreground hover:border-border-strong hover:text-foreground',
            )}
          >
            <span aria-hidden className={cn('size-3 rounded-full', dotClass[emotion])} />
            {EMOTION_LABELS[emotion]}
          </button>
        )
      })}
    </div>
  )
}

export { EmotionPicker }
