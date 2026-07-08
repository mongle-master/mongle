import { cn } from '@/lib/utils'

export const tagChipBaseClass =
  'inline-flex h-7 w-fit shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent px-3.5 text-[13px] leading-none font-bold whitespace-nowrap transition-colors'

export function tagChipClass(
  active: boolean,
  {
    activeClassName = 'border-primary bg-primary text-primary-foreground',
    inactiveClassName = 'border-border bg-card text-foreground',
    className,
  }: {
    activeClassName?: string
    inactiveClassName?: string
    className?: string
  } = {},
) {
  return cn(
    tagChipBaseClass,
    active ? activeClassName : inactiveClassName,
    className,
  )
}
