import type { ChipResponse, PersonResponse } from '@/apis/generated/models'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { tagChipClass } from '@/components/ui/tag-chip'
import { formatPersonName } from '@/lib/format'
import { cn } from '@/lib/utils'

export const timelineFilterChipClass = (selected: boolean) =>
  tagChipClass(selected)

const personFilterChipClass = (selected: boolean) =>
  cn(
    'inline-flex h-9 max-w-full items-center gap-1.5 rounded-full border px-1.5 pr-3 text-[13px] leading-none font-extrabold whitespace-nowrap transition-all',
    selected
      ? 'border-foreground bg-foreground text-background'
      : 'border-border/80 bg-background text-foreground hover:border-foreground/30 hover:bg-muted/60',
  )

export function TimelineCategoryFilters({
  chips,
  selectedIds,
  onToggle,
}: {
  chips: ChipResponse[]
  selectedIds: number[]
  onToggle: (chipId: number) => void
}) {
  if (chips.length === 0) return null

  return (
    <section className="mb-4">
      <p className="mb-2 text-[11px] font-extrabold text-muted-foreground">
        카테고리
      </p>
      <div className="flex flex-wrap gap-2">
        {chips.map((chip) => {
          const selected = selectedIds.includes(chip.id)
          return (
            <button
              key={chip.id}
              type="button"
              onClick={() => onToggle(chip.id)}
              className={timelineFilterChipClass(selected)}
            >
              {chip.label}
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function TimelinePersonFilters({
  persons,
  selectedIds,
  onToggle,
}: {
  persons: PersonResponse[]
  selectedIds: number[]
  onToggle: (personId: number) => void
}) {
  return (
    <section className="mb-3">
      <p className="mb-2 text-[11px] font-extrabold text-muted-foreground">
        사람
      </p>
      <div className="flex flex-wrap gap-2">
        {persons.map((person) => {
          const selected = selectedIds.includes(person.id)
          const displayName = formatPersonName(person)
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => onToggle(person.id)}
              aria-pressed={selected}
              className={personFilterChipClass(selected)}
            >
              <MonogramAvatar
                name={person.name}
                imageUrl={person.profileImageUrl}
                gender={person.gender ?? undefined}
                personId={person.id}
                className={cn('size-6', selected && 'ring-2 ring-background')}
              />
              <span className="truncate">{displayName}</span>
            </button>
          )
        })}
      </div>
    </section>
  )
}

export function TimelineFilterReset({
  visible,
  onReset,
}: {
  visible: boolean
  onReset: () => void
}) {
  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onReset}
      className="mt-1 inline-flex h-8 items-center rounded-full bg-muted px-3 text-xs font-extrabold text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
    >
      필터 초기화
    </button>
  )
}
