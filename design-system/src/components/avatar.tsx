import { cva, type VariantProps } from 'class-variance-authority'
import type * as React from 'react'

import { cn } from '@/lib/utils'

const avatarVariants = cva(
  'relative inline-flex shrink-0 items-center justify-center overflow-hidden rounded-full bg-secondary text-secondary-foreground select-none',
  {
    variants: {
      size: {
        sm: 'size-6 text-[10px]',
        default: 'size-8 text-caption',
        lg: 'size-12 text-title-sm',
      },
    },
    defaultVariants: {
      size: 'default',
    },
  },
)

function Avatar({
  className,
  size,
  src,
  alt,
  fallback,
  ...props
}: React.ComponentProps<'span'> &
  VariantProps<typeof avatarVariants> & {
    src?: string
    alt?: string
    fallback: string
  }) {
  return (
    <span data-slot="avatar" className={cn(avatarVariants({ size }), className)} {...props}>
      {src ? (
        <img src={src} alt={alt ?? fallback} className="aspect-square size-full object-cover" />
      ) : (
        <span aria-hidden className="font-medium">{fallback}</span>
      )}
    </span>
  )
}

export { Avatar, avatarVariants }
