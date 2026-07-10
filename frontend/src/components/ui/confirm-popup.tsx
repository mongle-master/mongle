import { X } from 'lucide-react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function ConfirmPopup({
  open,
  title,
  description,
  confirmLabel = '확인',
  cancelLabel = '취소',
  destructive = false,
  pending = false,
  onOpenChange,
  onConfirm,
}: {
  open: boolean
  title: string
  description: ReactNode
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  if (!open) return null

  const handleClose = () => {
    if (!pending) onOpenChange(false)
  }

  return (
    <div className="fixed inset-0 z-[70] flex items-center justify-center p-5">
      <button
        type="button"
        className="absolute inset-0 bg-black/45"
        aria-label="닫기"
        disabled={pending}
        onClick={handleClose}
      />
      <div
        className="relative w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-popup-title"
        aria-describedby="confirm-popup-description"
      >
        <button
          type="button"
          onClick={handleClose}
          disabled={pending}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>

        <div className="pr-9">
          <h2
            id="confirm-popup-title"
            className="text-base font-extrabold tracking-tight text-foreground"
          >
            {title}
          </h2>
          <p
            id="confirm-popup-description"
            className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
        </div>

        <div className="mt-5 flex gap-2">
          <Button
            type="button"
            variant="outline"
            onClick={handleClose}
            disabled={pending}
            className="h-11 flex-1 rounded-full font-extrabold"
          >
            {cancelLabel}
          </Button>
          <Button
            type="button"
            variant={destructive ? 'destructive' : 'default'}
            onClick={onConfirm}
            disabled={pending}
            className={cn(
              'h-11 flex-1 rounded-full font-extrabold',
              destructive &&
                'bg-destructive text-white hover:bg-destructive/90',
            )}
          >
            {pending ? '처리 중...' : confirmLabel}
          </Button>
        </div>
      </div>
    </div>
  )
}
