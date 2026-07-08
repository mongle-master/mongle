import type { ChipResponse, PersonResponse } from '@/lib/api/types'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { tagChipClass } from '@/components/ui/tag-chip'
import { mediaUrl } from '@/lib/api/client'
import { monogram } from '@/lib/format'
import { cn } from '@/lib/utils'

export const timelineFilterChipClass = (selected: boolean) =>
  tagChipClass(selected)

const personFilterChipClass = (selected: boolean) =>
  cn(
    'inline-flex h-8 max-w-full items-center gap-1.5 rounded-full border px-1.5 pr-3 text-[13px] leading-none font-extrabold whitespace-nowrap transition-colors',
    selected
      ? 'border-primary/30 bg-primary/10 text-primary'
      : 'border-border/80 bg-background text-foreground hover:bg-muted/60',
  )

function PersonFilterAvatar({
  person,
  selected,
}: {
  person: PersonResponse
  selected: boolean
}) {
  const src = mediaUrl(person.profileImageUrl)

  return (
    <Avatar
      size="sm"
      className={cn(
        'size-5 bg-muted after:border-0',
        selected && 'bg-primary/15',
      )}
    >
      {src ? <AvatarImage src={src} alt={person.name} /> : null}
      <AvatarFallback
        className={cn(
          'text-[11px] font-extrabold',
          selected
            ? 'bg-primary/15 text-primary'
            : 'bg-muted text-muted-foreground',
        )}
      >
        {monogram(person.name)}
      </AvatarFallback>
    </Avatar>
  )
}

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
              aria-pressed={selected}
              className={personFilterChipClass(selected)}
            >
              <PersonFilterAvatar person={person} selected={selected} />
              <span className="truncate">{person.name}</span>
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
