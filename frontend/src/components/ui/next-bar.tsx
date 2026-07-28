import { cn } from '@/lib/utils'

// 다음 단계로. 디자인 언어의 CTA 문법: 잉크 pill, 48px, 무게 500.
// record는 전체 스크롤이라 CTA를 sticky로 바닥 고정, person-new는 껍데기가 고정이라
// 불필요 (스크롤 모델 차이, mustpass person-input.md / record-input.md).
// sticky는 호출자가 넘기는 스크롤 모델 신호라 하드코딩하지 않는다.
export function NextBar({
  onNext,
  disabled = false,
  label,
  sticky,
}: {
  onNext: () => void
  disabled?: boolean
  label: string
  sticky?: boolean
}) {
  return (
    <div
      className={cn(
        'w-full bg-background px-5 pt-1 pb-[max(1rem,env(safe-area-inset-bottom))]',
        sticky && 'sticky bottom-0',
      )}
    >
      <button
        type="button"
        onClick={onNext}
        disabled={disabled}
        className="h-12 w-full rounded-pill bg-primary text-lg font-medium text-primary-foreground transition-colors hover:bg-primary-hover disabled:opacity-30"
      >
        {label}
      </button>
    </div>
  )
}
