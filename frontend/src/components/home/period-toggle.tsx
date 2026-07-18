import { HOME_PERIOD_OPTIONS } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { TagChip } from '@/components/ui/tag-chip'

export function HomePeriodToggle({
  value,
  onChange,
}: {
  value: HomePeriod
  onChange: (period: HomePeriod) => void
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {HOME_PERIOD_OPTIONS.map((option) => {
        const active = value === option.value
        return (
          <TagChip
            key={option.value}
            tone="foreground"
            surface="card-muted"
            selected={active}
            onClick={() => onChange(option.value)}
          >
            {option.label}
          </TagChip>
        )
      })}
    </div>
  )
}
