import { cn } from '@/lib/utils'

export function ListGroup({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'overflow-hidden rounded-xl bg-muted/50 dark:bg-muted/30',
        className,
      )}
    >
      {children}
    </div>
  )
}
