import type { ChipResponse } from '@/apis/generated/mongle-api.schemas'
import { TagChip } from '@/components/ui/tag-chip'

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
      <p className="mb-2 text-caption font-extrabold text-muted-foreground">
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
