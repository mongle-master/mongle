import type { ComponentProps } from 'react'
import { Label } from '@/components/ui/label'
import { cn } from '@/lib/utils'

// 디자인 언어: 폼 라벨은 13px/600 — 조용하지만 읽히는 무게(800 금지).
export function FieldLabel({
  className,
  children,
  ...props
}: ComponentProps<typeof Label>) {
  return (
    <Label className={cn('text-label font-semibold', className)} {...props}>
      {children}
    </Label>
  )
}
