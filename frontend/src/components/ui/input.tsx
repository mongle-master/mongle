import * as React from 'react'

import { cn } from '@/lib/utils'

function Input({ className, type, ...props }: React.ComponentProps<'input'>) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        // 디자인 언어: 입력은 44px(h-11), 반경 8px, 포커스는 2px 잉크 보더.
        // 보더가 1→2px로 두꺼워질 때 가로 패딩을 1px 줄여 레이아웃 흔들림을 막는다.
        'h-11 w-full min-w-0 rounded-md border border-input bg-transparent px-4 py-1 text-left text-body transition-colors outline-none file:inline-flex file:h-6 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-foreground focus-visible:px-[15px] disabled:pointer-events-none disabled:cursor-not-allowed disabled:bg-input/50 disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-3 aria-invalid:ring-destructive/20 dark:bg-input/30 dark:disabled:bg-input/80 dark:aria-invalid:border-destructive/50 dark:aria-invalid:ring-destructive/40',
        className,
      )}
      {...props}
    />
  )
}

export { Input }
