import { useMemo, useState } from 'react'
import {
  ACTIVITY_FLOW_PERIOD_OPTIONS,
  buildRecordActivityFlow,
} from '@/lib/timeline-activity-flow'
import type { ActivityFlowPeriod } from '@/lib/timeline-activity-flow'
import { cn } from '@/lib/utils'

export function ActivityFlowChart({
  dates,
  selectedMonth,
  onSelectMonth,
}: {
  /** 기록 발생일 YYYY-MM-DD. 각 날짜가 시간축 실제 위치에 점으로 찍힌다. */
  dates: Array<string | null | undefined>
  selectedMonth?: string | null
  onSelectMonth?: (month: string | null) => void
}) {
  const [period, setPeriod] = useState<ActivityFlowPeriod>('1Y')
  const [menuOpen, setMenuOpen] = useState(false)

  const flow = useMemo(
    () => buildRecordActivityFlow(dates, period),
    [dates, period],
  )

  if (!flow) return null

  const periodLabel =
    ACTIVITY_FLOW_PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? '1년'

  return (
    <div className="rounded-lg border border-border bg-card p-3.5">
      <div className="relative mb-1 flex items-start justify-between gap-2">
        <div>
          <p className="text-[13px] font-extrabold">활동 흐름</p>
          <p className="text-[11px] text-muted-foreground">
            기록한 날짜에 점이 찍혀요 · 점을 눌러 그날만 보기
          </p>
        </div>

        <div className="relative shrink-0">
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            className="rounded-full border border-border bg-background px-2.5 py-1 text-[11px] font-bold text-foreground"
            aria-expanded={menuOpen}
            aria-haspopup="listbox"
          >
            {periodLabel}
          </button>
          {menuOpen ? (
            <ul
              role="listbox"
              className="absolute top-full right-0 z-20 mt-1 min-w-[4.5rem] overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-md"
            >
              {ACTIVITY_FLOW_PERIOD_OPTIONS.map((option) => (
                <li key={option.value}>
                  <button
                    type="button"
                    role="option"
                    aria-selected={period === option.value}
                    onClick={() => {
                      setPeriod(option.value)
                      setMenuOpen(false)
                      onSelectMonth?.(null)
                    }}
                    className={cn(
                      'flex w-full px-3 py-1.5 text-left text-[11px] font-bold',
                      period === option.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-foreground hover:bg-muted',
                    )}
                  >
                    {option.label}
                  </button>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      </div>

      {flow.quietMessage ? (
        <p className="mb-3 text-xs text-muted-foreground">
          {flow.quietMessage}
        </p>
      ) : null}

      <div className="mt-3 flex items-center gap-2">
        <span className="w-9 shrink-0 text-[11px] font-bold text-muted-foreground">
          기록
        </span>
        <div className="relative h-5 flex-1">
          <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 bg-border" />
          {flow.points.map((point) => {
            const isSelected = selectedMonth === point.monthKey
            return (
              <button
                key={point.id}
                type="button"
                disabled={!onSelectMonth}
                onClick={() =>
                  onSelectMonth?.(isSelected ? null : point.monthKey)
                }
                style={{ left: `${point.position * 100}%` }}
                title={point.date}
                className={cn(
                  'absolute top-1/2 size-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary transition-transform hover:scale-125',
                  isSelected && 'ring-2 ring-foreground ring-offset-1',
                )}
                aria-label={`${point.date} 기록`}
              />
            )
          })}
        </div>
      </div>

      <div className="relative mt-1 ml-11 h-4">
        {flow.axisLabels.map((label) => (
          <span
            key={`${label.text}-${label.position}`}
            style={{ left: `${label.position * 100}%` }}
            className="absolute -translate-x-1/2 text-[10px] font-bold text-muted-foreground"
          >
            {label.text}
          </span>
        ))}
      </div>
    </div>
  )
}
