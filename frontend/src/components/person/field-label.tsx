import type { ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

export function FieldLabel({
  className,
  children,
  ...props
}: ComponentProps<typeof Label>) {
  return (
    <Label className={cn('font-extrabold', className)} {...props}>
      {children}
    </Label>
  )
}
