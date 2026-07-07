import { HOME_PERIOD_OPTIONS } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { cn } from '@/lib/utils'

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
            className={cn(
              'rounded-full border px-3 py-1.5 text-xs font-bold',
              active
                ? 'border-foreground bg-foreground text-background'
                : 'border-border bg-card text-muted-foreground',
            )}
          >
            {option.label}
          </button>
        )
      })}
    </div>
  )
}
