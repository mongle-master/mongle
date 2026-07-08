import { HOME_PERIOD_OPTIONS } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { tagChipClass } from '@/components/ui/tag-chip'

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
          <button
            key={option.value}
            type="button"
            onClick={() => onChange(option.value)}
            className={tagChipClass(active, {
              activeClassName:
                'border-foreground bg-foreground text-background',
              inactiveClassName: 'border-border bg-card text-muted-foreground',
            })}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
