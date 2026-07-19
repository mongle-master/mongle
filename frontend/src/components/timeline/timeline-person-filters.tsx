import type { PersonResponse } from '@/apis/generated/mongle-api.schemas'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { TagChip } from '@/components/ui/tag-chip'
import { formatPersonName } from '@/lib/format'
import { cn } from '@/lib/utils'

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
      <p className="mb-2 text-caption font-extrabold text-muted-foreground">
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
