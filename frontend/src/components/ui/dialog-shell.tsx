import { X } from 'lucide-react'
import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { createPortal } from 'react-dom'
import { cn } from '@/lib/utils'

// 진입·퇴장 전환은 keyframes가 아닌 transition으로 구현한다:
// 닫히는 도중 다시 열려도 처음부터 재생되지 않고 현재 지점에서 부드럽게 되돌아온다.
// 퇴장 전환이 보이려면 open=false 이후에도 잠시 마운트가 유지돼야 해서
// open과 별도의 mounted 상태를 두고 opacity transitionend 시점에 언마운트한다.
//
// 포탈 대상은 body가 아니라 stackflow 셸이 주입하는 #stack-overlay-root다:
// stack-viewport의 max-w-md 제약 안에서 떠야 PC에서도 화면 밖으로 새지 않는다.
//
// 크롬(포탈·백드롭·카드·닫기)만 소유하고 제목·본문·푸터는 children으로 받는다.
export function DialogShell({
  open,
  onOpenChange,
  labelledBy,
  describedBy,
  closeDisabled = false,
  children,
}: {
  open: boolean
  onOpenChange: (open: boolean) => void
  labelledBy: string
  describedBy?: string
  closeDisabled?: boolean
  children: ReactNode
}) {
  const [mounted, setMounted] = useState(open)

  useEffect(() => {
    if (open) setMounted(true)
  }, [open])

  if (!mounted) return null

  const overlayRoot = document.getElementById('stack-overlay-root')
  if (!overlayRoot) return null

  const handleClose = () => {
    if (!closeDisabled) onOpenChange(false)
  }

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
        disabled={closeDisabled}
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
        aria-labelledby={labelledBy}
        aria-describedby={describedBy}
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
          disabled={closeDisabled}
          className="absolute right-4 top-4 flex size-8 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:opacity-40"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>

        {children}
      </div>
    </div>,
    overlayRoot,
  )
}
