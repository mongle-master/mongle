import type * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        'h-11 w-full rounded-md border border-input-border bg-input px-4 py-3 text-body-md text-foreground placeholder:text-muted-foreground',
        'transition-colors focus-visible:border-2 focus-visible:border-foreground focus-visible:px-[15px] focus-visible:py-[11px] focus-visible:outline-none',
        'disabled:cursor-not-allowed disabled:opacity-50',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
