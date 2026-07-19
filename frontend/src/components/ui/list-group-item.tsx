import { cn } from '@/lib/utils'

export function ListGroupItem({
  children,
  className,
  withDivider = true,
}: {
  children: React.ReactNode
  className?: string
  withDivider?: boolean
}) {
  return (
    <div
      className={cn(
        'px-4 py-3.5',
        withDivider && 'border-b border-border/50 last:border-b-0',
        className,
      )}
    >
      {children}
    </div>
  )
}
