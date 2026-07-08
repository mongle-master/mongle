import type { ChipResponse, PersonResponse } from '@/lib/api/types'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { tagChipClass } from '@/components/ui/tag-chip'

export const timelineFilterChipClass = (selected: boolean) =>
  tagChipClass(selected)

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
      <p className="mb-2 text-xs font-extrabold text-muted-foreground">
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
    <section className="mb-5">
      <p className="mb-2 text-xs font-extrabold text-muted-foreground">사람</p>
      <div className="flex flex-wrap gap-2">
        {persons.map((person) => {
          const selected = selectedIds.includes(person.id)
          return (
            <button
              key={person.id}
              type="button"
              onClick={() => onToggle(person.id)}
              className={timelineFilterChipClass(selected)}
            >
              <MonogramAvatar
                name={person.name}
                imageUrl={person.profileImageUrl}
                className="size-6"
              />
              {person.name}
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
      className="mb-4 text-xs font-bold text-muted-foreground underline"
    >
      필터 초기화
    </button>
  )
}
