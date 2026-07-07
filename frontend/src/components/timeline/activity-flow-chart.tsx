import { cn } from '@/lib/utils'
import type { ActivityFlowResponse } from '@/lib/api/types'

export function ActivityFlowChart({
  flow,
  selectedMonth,
  onSelectMonth,
}: {
  flow: ActivityFlowResponse
  selectedMonth?: string | null
  onSelectMonth?: (month: string | null) => void
}) {
  if (!flow.hasAnyActivity || flow.months.length === 0) return null

  const recentQuiet = !flow.lanes.some((lane) => lane.present.some(Boolean))

  return (
    <div className="rounded-2xl border border-border bg-card p-3.5">
      <p className="text-[13px] font-extrabold">활동 흐름</p>
      <p className="mb-3 text-[11px] text-muted-foreground">
        점을 눌러 그달 기록만 보기
      </p>

      {recentQuiet ? (
        <p className="mb-3 text-xs text-muted-foreground">
          최근 6개월은 조용했어요
        </p>
      ) : null}

      {flow.lanes.map((lane) => (
        <div key={lane.lane} className="mb-2 flex items-center gap-2">
          <span className="w-9 text-[11px] font-bold text-muted-foreground">
            {lane.categoryLabel}
          </span>
          <div className="relative flex flex-1 justify-between">
            <div className="absolute top-1/2 right-0 left-0 h-px bg-border" />
            {lane.present.map((on, i) => {
              const month = flow.months[i]
              if (!month) return null
              const isSelected = selectedMonth === month
              return (
                <button
                  key={`${lane.lane}-${month}`}
                  type="button"
                  disabled={!on || !onSelectMonth}
                  onClick={() => onSelectMonth?.(isSelected ? null : month)}
                  className={cn(
                    'relative z-10 size-2.5 rounded-full transition-transform',
                    on
                      ? 'bg-primary hover:scale-125'
                      : 'border border-muted-foreground/30 bg-background',
                    isSelected && 'ring-2 ring-foreground ring-offset-1',
                    !on && 'cursor-default',
                  )}
                  aria-label={`${month} ${lane.categoryLabel}`}
                />
              )
            })}
          </div>
        </div>
      ))}

      <div className="mt-1 flex justify-between pl-9 text-[10px] font-bold text-muted-foreground">
        {flow.months.map((m) => (
          <span key={m}>{Number(m.slice(5))}월</span>
        ))}
      </div>
    </div>
  )
}
