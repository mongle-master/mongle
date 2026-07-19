import { MongleIcon } from '@/components/brand/mongle-icon'
import { cn } from '@/lib/utils'

export function MongleLogo({
  className,
  iconClassName,
  textClassName,
}: {
  className?: string
  iconClassName?: string
  textClassName?: string
}) {
  return (
    <div className={cn('flex items-center gap-2', className)}>
      <MongleIcon className={iconClassName} />
      <span
        className={cn('text-sm font-extrabold tracking-tight', textClassName)}
      >
        Mongle
      </span>
    </div>
  )
}
