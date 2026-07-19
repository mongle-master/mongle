import { cn } from '@/lib/utils'

export function ListGroupInset({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-xl bg-background/80 p-2 dark:bg-background/40',
        className,
      )}
    >
      {children}
    </div>
  )
}
