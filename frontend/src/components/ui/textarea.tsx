import * as React from 'react'

import { cn } from '@/lib/utils'

function Textarea({ className, ...props }: React.ComponentProps<'textarea'>) {
  return (
    <textarea
      data-slot="textarea"
      className={cn(
        // 디자인 언어: 반경 8px, 포커스는 2px 잉크 보더(패딩 보정 동반).
        'flex field-sizing-content min-h-16 w-full rounded-md border border-input bg-transparent px-4 py-3 text-body transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-foreground focus-visible:px-[15px] focus-visible:py-[11px] disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}

export { Textarea }
