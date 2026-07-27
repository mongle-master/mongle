import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

import type { Emotion } from './emotions'

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-pill border px-2.5 py-0.5 text-eyebrow font-semibold uppercase tracking-wide transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-secondary text-secondary-foreground',
        outline: 'border-border-strong text-foreground',
        destructive: 'border-transparent bg-destructive text-destructive-foreground',
        success: 'border-transparent bg-success/10 text-success',
        warning: 'border-transparent bg-warning/10 text-warning',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

const emotionDotClass: Record<Emotion, string> = {
  calm: 'bg-emotion-calm',
  warm: 'bg-emotion-warm',
  muse: 'bg-emotion-muse',
  clear: 'bg-emotion-clear',
  dear: 'bg-emotion-dear',
}

function Badge({
  className,
  variant,
  emotion,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof badgeVariants> & { emotion?: Emotion }) {
  return (
    <span
      data-slot="badge"
      data-emotion={emotion}
      className={cn(badgeVariants({ variant }), className)}
      {...props}
    >
      {emotion ? (
        <span
          aria-hidden
          className={cn('size-2 rounded-full', emotionDotClass[emotion])}
        />
      ) : null}
      {props.children}
    </span>
  )
}

export { Badge, badgeVariants }
