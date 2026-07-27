import { cn } from '@/lib/utils'

export function ListGroupInset({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div className={cn('rounded-lg bg-muted/40 p-2', className)}>
      {children}
    </div>
  )
}
