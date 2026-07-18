import type {
  ChipResponse,
  PersonResponse,
} from '@/apis/generated/mongle-api.schemas'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { TagChip } from '@/components/ui/tag-chip'
import { formatPersonName } from '@/lib/format'
import { cn } from '@/lib/utils'

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
            <TagChip
              key={chip.id}
              tone="primary"
              surface="card"
              selected={selected}
              onClick={() => onToggle(chip.id)}
              data-amp-mask={chip.personal || undefined}
            >
              {chip.label}
            </TagChip>
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
            <TagChip
              key={person.id}
              tone="foreground"
              size="xl"
              surface="outline"
              selected={selected}
              onClick={() => onToggle(person.id)}
            >
              <MonogramAvatar
                name={person.name}
                imageUrl={person.profileImageUrl}
                gender={person.gender ?? undefined}
                personId={person.id}
                className={cn('size-6', selected && 'ring-2 ring-background')}
              />
              <span data-amp-mask className="truncate">
                {displayName}
              </span>
            </TagChip>
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
