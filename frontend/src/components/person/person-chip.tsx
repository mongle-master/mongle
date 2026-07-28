import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import type { PersonImageGender } from '@/lib/default-person-image'
import { cn } from '@/lib/utils'

// 기록 카드·상세에서 "함께한 사람"을 나타내는 작은 pill.
// onClick을 주면 인물 화면으로 이동하는 버튼이 된다(hover 피드백 포함).
// 여러 명이면 호출부가 linkedPersonsLabel 등으로 만든 label을 넘긴다.
export function PersonChip({
  name,
  imageUrl,
  personId,
  gender,
  favorite,
  label,
  onClick,
  className,
}: {
  name: string
  imageUrl?: string | null
  personId?: number | null
  gender?: PersonImageGender
  favorite?: boolean
  label?: string
  onClick?: () => void
  className?: string
}) {
  const inner = (
    <>
      <MonogramAvatar
        name={name}
        imageUrl={imageUrl}
        personId={personId}
        gender={gender}
        favorite={favorite}
        className="size-6"
      />
      <span
        data-amp-mask
        className="truncate text-xs font-semibold text-foreground"
      >
        {label ?? name}
      </span>
    </>
  )

  const chipClass = cn(
    'inline-flex max-w-full items-center gap-1.5 rounded-full bg-muted/70 py-1 pr-2.5 pl-1',
    className,
  )

  if (onClick) {
    return (
      <button
        type="button"
        data-slot="person-chip"
        onClick={onClick}
        className={cn(chipClass, 'transition-colors hover:bg-muted')}
      >
        {inner}
      </button>
    )
  }

  return (
    <span data-slot="person-chip" className={chipClass}>
      {inner}
    </span>
  )
}
