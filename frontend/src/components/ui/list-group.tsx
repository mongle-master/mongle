import { cn } from '@/lib/utils'

export function ListGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-3 text-caption font-extrabold tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  )
}

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
        'overflow-hidden rounded-2xl bg-muted/50 dark:bg-muted/30',
        className,
      )}
    >
      {children}
    </div>
  )
}

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

export function ListGroupFooter({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 px-3 text-caption font-medium leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}

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
