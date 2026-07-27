import { Clock3, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'

// "1년 전 오늘" 회고 플로팅 카드. 홈 탭 하단에 떠서 과거 기록으로 이끈다.
// 진입·퇴장 전환과 퇴장 완료 통지는 카드가 소유하고, 데이터·탐색·애널리틱스는
// 화면(home-tab)이 소유한다.
export function ThrowbackCard({
  occurredDate,
  title,
  personName,
  exiting = false,
  onOpen,
  onDismiss,
  onExitEnd,
}: {
  occurredDate: string
  title?: string | null
  personName: string
  exiting?: boolean
  onOpen: () => void
  onDismiss: () => void
  onExitEnd: () => void
}) {
  return (
    <div
      className={cn(
        'pointer-events-auto mx-auto w-full max-w-md',
        exiting
          ? 'animate-out fade-out slide-out-to-bottom-6 duration-300 ease-out fill-mode-forwards'
          : 'animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out',
      )}
      onAnimationEnd={() => {
        if (exiting) onExitEnd()
      }}
    >
      <Card className="relative flex min-h-[82px] flex-row items-center gap-3 border border-border bg-card p-3.5 pr-10 text-card-foreground shadow-e4">
        <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <Clock3 className="size-5" />
        </div>
        <button
          type="button"
          onClick={onOpen}
          className="min-w-0 flex-1 text-left"
        >
          <p className="text-sm font-medium text-foreground">
            1년 전 오늘
            <span className="ml-2 text-caption font-bold text-muted-foreground">
              {occurredDate}
            </span>
          </p>
          <p
            data-amp-mask
            className="mt-1 line-clamp-2 text-label font-medium text-muted-foreground"
          >
            {title ?? `작년 이맘때 ${personName}`}
          </p>
        </button>
        <button
          type="button"
          onClick={onDismiss}
          disabled={exiting}
          className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none"
          aria-label="닫기"
        >
          <X className="size-4" />
        </button>
      </Card>
    </div>
  )
}
