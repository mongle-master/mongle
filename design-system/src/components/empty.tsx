import type * as React from 'react'

import { cn } from '@/lib/utils'

/* 빈 상태: 원인 + 다음 행동을 함께 보여준다 (design.md 화면 밀도 규칙) */
function Empty({
  className,
  icon,
  title,
  description,
  action,
  ...props
}: React.ComponentProps<'div'> & {
  icon?: React.ReactNode
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div
      data-slot="empty"
      className={cn('flex flex-col items-center justify-center gap-3 py-16 text-center', className)}
      {...props}
    >
      {icon ? <div className="text-muted-foreground/60">{icon}</div> : null}
      <div className="flex flex-col gap-1">
        <p className="text-title-sm font-medium text-foreground">{title}</p>
        {description ? <p className="text-body-sm text-muted-foreground">{description}</p> : null}
      </div>
      {action ? <div className="mt-2">{action}</div> : null}
    </div>
  )
}

export { Empty }
