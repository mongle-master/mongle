import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// 진입·퇴장 전환은 keyframes가 아닌 transition으로 구현한다:
// 닫히는 도중 다시 열려도 처음부터 재생되지 않고 현재 지점에서 부드럽게 되돌아온다.
// 퇴장 전환이 보이려면 open=false 이후에도 잠시 마운트가 유지돼야 해서
// open과 별도의 mounted 상태를 두고 opacity transitionend 시점에 언마운트한다.
export function ConfirmPopup({
  open,
  title,
  description,
  error,
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
  error?: string
  confirmLabel?: string
  cancelLabel?: string
  destructive?: boolean
  pending?: boolean
  onOpenChange: (open: boolean) => void
  onConfirm: () => void
}) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  if (!mounted) return null

  const handleClose = () => {
    if (!pending) onOpenChange(false)
  }

  const overlayRoot = document.getElementById('stack-overlay-root')
  if (!overlayRoot) return null

  return createPortal(
    <div
      className={cn(
        'pointer-events-auto absolute inset-0 flex items-center justify-center p-5',
        // 퇴장 중에는 아래 화면 조작을 막지 않는다
        !open && 'pointer-events-none',
      )}
    >
      <button
        type="button"
        className={cn(
          'absolute inset-0 bg-black/45 transition-opacity duration-200 ease-out starting:opacity-0',
          !open && 'opacity-0 duration-150',
        )}
        aria-label="닫기"
        disabled={pending}
        onClick={handleClose}
      />
      <div
        className={cn(
          'relative w-full max-w-sm rounded-2xl border border-border bg-background p-5 shadow-2xl',
          'transition-[scale,opacity] duration-200 ease-[cubic-bezier(0.23,1,0.32,1)]',
          'starting:scale-95 starting:opacity-0 motion-reduce:starting:scale-100',
          !open && 'scale-95 opacity-0 duration-150 motion-reduce:scale-100',
        )}
        role="dialog"
        aria-modal="true"
        aria-labelledby="confirm-popup-title"
        aria-describedby="confirm-popup-description"
        onTransitionEnd={(event) => {
          if (
            !open &&
            event.target === event.currentTarget &&
            event.propertyName === 'opacity'
          ) {
            setMounted(false)
          }
        }}
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
            data-amp-mask
            className="mt-2 whitespace-pre-line text-sm font-medium leading-relaxed text-muted-foreground"
          >
            {description}
          </p>
          {error ? (
            <p className="mt-3 text-sm font-bold text-destructive" role="alert">
              {error}
            </p>
          ) : null}
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
    </div>,
    overlayRoot,
  )
}
