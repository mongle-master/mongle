import { cn } from '@/lib/utils'

export function MongleIcon({ className }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="currentColor"
      aria-hidden
      className={cn('size-6 shrink-0', className)}
    >
      <circle cx="9.5" cy="12" r="7.5" />
      <circle cx="16.5" cy="9" r="4.5" />
    </svg>
  )
}
