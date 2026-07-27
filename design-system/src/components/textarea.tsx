import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const textareaVariants = cva(
  'w-full rounded-md text-foreground placeholder:text-muted-foreground focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50',
  {
    variants: {
      variant: {
        default:
          'border border-input-border bg-input px-4 py-3 text-body-md transition-colors focus-visible:border-2 focus-visible:border-foreground',
        /* 편지지: 괘선(28px)에 행간을 맞춰 손글씨 폰트로 쓴다 */
        letter:
          'letter-paper font-hand border-none bg-transparent px-2 pt-1 text-title-sm leading-[28px] focus-visible:ring-0',
      },
    },
    defaultVariants: {
      variant: 'default',
    },
  },
)

function Textarea({
  className,
  variant,
  ...props
}: React.ComponentProps<'textarea'> & VariantProps<typeof textareaVariants>) {
  return (
    <textarea
      data-slot="textarea"
      data-variant={variant ?? 'default'}
      className={cn(textareaVariants({ variant }), className)}
      {...props}
    />
  )
}

export { Textarea, textareaVariants }
