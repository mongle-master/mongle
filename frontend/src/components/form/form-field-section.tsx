import type { ReactNode } from 'react'
import { cn } from '@/lib/utils'

export function FormFieldSection({
  title,
  children,
  className,
}: {
  title: string
  children: ReactNode
  className?: string
}) {
  return (
    <section className={className}>
      <p className="mb-2 text-xs font-extrabold text-muted-foreground">
        {title}
      </p>
      {children}
    </section>
  )
}

export function FormFieldCard({
  children,
  className,
}: {
  children: ReactNode
  className?: string
}) {
  return (
    <div
      className={cn(
        'rounded-lg border border-border bg-card px-3 py-2.5',
        className,
      )}
    >
      {children}
    </div>
  )
}
