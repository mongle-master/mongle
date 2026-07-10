import { useMemo, useState } from 'react'
import { ChevronDown } from 'lucide-react'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import {
  ACTIVITY_FLOW_PERIOD_OPTIONS,
  buildPersonActivityFlow,
} from '@/lib/timeline-activity-flow'
import type {
  ActivityFlowPeriod,
  ActivityFlowRecord,
  ActivityFlowSelection,
} from '@/lib/timeline-activity-flow'
import type { PersonImageGender } from '@/lib/default-person-image'
import { cn } from '@/lib/utils'

const LANE_LABEL_WIDTH = 'w-24'
const AXIS_LABEL_OFFSET = 'ml-26'

type ActivityFlowPerson = {
  id: number
  name: string
  profileImageUrl?: string | null
  gender?: PersonImageGender
}

export function ActivityFlowChart({
  persons,
  records,
  selectedPoint,
  onSelectPoint,
}: {
  /** Y축에 표시할 등록된 사람 목록 */
  persons: ActivityFlowPerson[]
  /** 사람별 기록 날짜 */
  records: ActivityFlowRecord[]
  selectedPoint?: ActivityFlowSelection | null
  onSelectPoint?: (point: ActivityFlowSelection | null) => void
}) {
  const [period, setPeriod] = useState<ActivityFlowPeriod>('1Y')
  const [menuOpen, setMenuOpen] = useState(false)

  const flow = useMemo(
    () => buildPersonActivityFlow(persons, records, period),
    [persons, records, period],
  )
  const personById = useMemo(
    () => new Map(persons.map((person) => [person.id, person])),
    [persons],
  )

  if (!flow) return null

  const periodLabel =
    ACTIVITY_FLOW_PERIOD_OPTIONS.find((o) => o.value === period)?.label ?? '1년'
  const axisLabelClass = (position: number) =>
    cn(
      'absolute text-[10px] leading-none font-bold text-muted-foreground whitespace-nowrap',
      position <= 0.02
        ? 'translate-x-0 text-left'
        : position >= 0.98
          ? '-translate-x-full text-right'
          : '-translate-x-1/2 text-center',
    )

  return (
    <div className="relative rounded-[0.4rem] bg-muted/55">
      <div className="pointer-events-none h-1 rounded-t-[0.4rem] bg-gradient-to-r from-foreground/80 via-muted-foreground/25 to-transparent" />
      <div className="p-4">
        <div className="relative mb-1 flex items-start justify-between gap-2">
          <div>
            <p className="text-sm font-extrabold">활동 흐름</p>
          </div>

          <div className="relative shrink-0">
            <button
              type="button"
              onClick={() => setMenuOpen((open) => !open)}
              className="inline-flex h-8 items-center gap-1 rounded-full border border-border bg-background px-3 text-[11px] font-extrabold text-foreground"
              aria-expanded={menuOpen}
              aria-haspopup="listbox"
            >
              {periodLabel}
              <ChevronDown
                className={cn(
                  'size-3 text-muted-foreground transition-transform',
                  menuOpen && 'rotate-180',
                )}
              />
            </button>
            {menuOpen ? (
              <ul
                role="listbox"
                className="absolute top-full right-0 z-30 mt-1 min-w-[4.5rem] overflow-hidden rounded-lg border border-border bg-popover py-1 shadow-md"
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
                        onSelectPoint?.(null)
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

        <div className="mt-4 space-y-1">
          {flow.lanes.map((lane, laneIndex) => {
            const person = personById.get(lane.personId)
            return (
              <div key={lane.personId} className="flex items-center gap-2">
                <div
                  className={cn(
                    LANE_LABEL_WIDTH,
                    'flex min-w-0 shrink-0 items-center gap-1.5',
                  )}
                  title={lane.label}
                >
                  <MonogramAvatar
                    name={lane.label}
                    imageUrl={person?.profileImageUrl}
                    gender={person?.gender}
                    personId={lane.personId}
                    className="size-5"
                  />
                  <span className="min-w-0 flex-1 truncate text-[11px] font-extrabold text-muted-foreground">
                    {lane.label}
                  </span>
                </div>
                <div className="relative h-7 flex-1">
                  <div className="absolute top-1/2 right-0 left-0 h-px -translate-y-1/2 rounded-full bg-muted-foreground/10" />
                  {lane.points.map((point, pointIndex) => {
                    const isSelected =
                      selectedPoint?.personId === lane.personId &&
                      selectedPoint.date === point.date
                    const bloomDelayMs = Math.min(
                      laneIndex * 28 + pointIndex * 22,
                      480,
                    )
                    return (
                      <button
                        key={point.id}
                        type="button"
                        disabled={!onSelectPoint}
                        onClick={() =>
                          onSelectPoint?.(
                            isSelected
                              ? null
                              : { personId: lane.personId, date: point.date },
                          )
                        }
                        style={{
                          left: `${point.position * 100}%`,
                          animationDelay: `${bloomDelayMs}ms`,
                        }}
                        title={point.date}
                        className={cn(
                          'absolute top-1/2 size-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-foreground shadow-[0_0_0_4px_rgba(0,0,0,0.04)] transition-transform hover:scale-125',
                          'motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-50 motion-safe:fill-mode-backwards motion-safe:duration-300 motion-safe:ease-out',
                          isSelected &&
                            'size-4 ring-2 ring-foreground ring-offset-2 ring-offset-card',
                        )}
                        aria-label={`${lane.label} ${point.date} 기록`}
                      />
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>

        <div className={cn('relative mt-1 h-4', AXIS_LABEL_OFFSET)}>
          {flow.axisLabels.map((label) => (
            <span
              key={`${label.text}-${label.position}`}
              style={{ left: `${label.position * 100}%` }}
              className={axisLabelClass(label.position)}
            >
              {label.text}
            </span>
          ))}
        </div>
      </div>
    </div>
  )
}
