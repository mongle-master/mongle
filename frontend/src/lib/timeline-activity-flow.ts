import type { TimelineCard } from '@/lib/api/types'

export type ActivityFlowPeriod = 'ALL' | '5Y' | '3Y' | '1Y'

export const ACTIVITY_FLOW_PERIOD_OPTIONS: Array<{
  value: ActivityFlowPeriod
  label: string
}> = [
  { value: 'ALL', label: '전체' },
  { value: '5Y', label: '5년' },
  { value: '3Y', label: '3년' },
  { value: '1Y', label: '1년' },
]

export type ActivityFlowPoint = {
  id: string
  /** YYYY-MM-DD */
  date: string
  /** YYYY-MM */
  monthKey: string
  /** 0~1 축상 위치 (실제 날짜 비율) */
  position: number
}

/** 활동 흐름 점 선택 — 해당 사람의 해당 날짜 기록만 리스트에 표시 */
export type ActivityFlowSelection = {
  personId: number
  date: string
}

export function matchesActivityFlowSelection(
  occurredDate: string,
  personIds: number[],
  selection: ActivityFlowSelection | null,
) {
  if (!selection) return true
  return (
    occurredDate === selection.date && personIds.includes(selection.personId)
  )
}

export type ActivityFlowAxisLabel = {
  text: string
  position: number
}

export type ActivityFlowRecord = {
  id: string
  /** YYYY-MM-DD */
  date: string
  personId: number
}

export type ActivityFlowPersonLane = {
  personId: number
  label: string
  points: ActivityFlowPoint[]
}

export type ActivityFlowModel = {
  period: ActivityFlowPeriod
  axisMode: 'month' | 'year'
  lanes: ActivityFlowPersonLane[]
  axisLabels: ActivityFlowAxisLabel[]
  hasAnyActivity: boolean
  quietMessage: string | null
}

function pad2(n: number) {
  return String(n).padStart(2, '0')
}

function localDate(year: number, month: number, day: number) {
  return new Date(year, month - 1, day)
}

function startOfDay(d: Date) {
  return localDate(d.getFullYear(), d.getMonth() + 1, d.getDate())
}

function daysBetween(a: Date, b: Date) {
  return Math.round((b.getTime() - a.getTime()) / (1000 * 60 * 60 * 24))
}

function parseIsoDate(iso: string): Date | null {
  if (/^\d{4}-\d{2}-\d{2}$/.test(iso)) {
    const [y, m, d] = iso.split('-').map(Number)
    return localDate(y, m, d)
  }
  if (/^\d{4}-\d{2}$/.test(iso)) {
    const [y, m] = iso.split('-').map(Number)
    return localDate(y, m, 1)
  }
  return null
}

function formatIso(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}-${pad2(d.getDate())}`
}

function monthKeyOf(d: Date) {
  return `${d.getFullYear()}-${pad2(d.getMonth() + 1)}`
}

function resolveWindow(
  period: ActivityFlowPeriod,
  recordDates: Date[],
  now = new Date(),
): { start: Date; end: Date } | null {
  const end = startOfDay(now)
  if (period === '1Y') {
    return { start: localDate(now.getFullYear(), 1, 1), end }
  }
  if (period === '3Y') {
    return { start: localDate(now.getFullYear() - 2, 1, 1), end }
  }
  if (period === '5Y') {
    return { start: localDate(now.getFullYear() - 4, 1, 1), end }
  }
  if (recordDates.length === 0) return null
  const earliest = recordDates.reduce((a, b) => (a < b ? a : b))
  const start = earliest < end ? earliest : end
  return { start, end }
}

function clamp01(n: number) {
  if (n < 0) return 0
  if (n > 1) return 1
  return n
}

function positionOf(date: Date, start: Date, end: Date) {
  const span = daysBetween(start, end)
  if (span <= 0) return 0.5
  return clamp01(daysBetween(start, date) / span)
}

function buildMonthAxisLabels(start: Date, end: Date) {
  const months =
    (end.getFullYear() - start.getFullYear()) * 12 +
    end.getMonth() -
    start.getMonth() +
    1

  return Array.from({ length: months }, (_, index) => {
    const tick = localDate(start.getFullYear(), start.getMonth() + 1 + index, 1)
    return {
      text: `${tick.getMonth() + 1}월`,
      position: months === 1 ? 0.5 : index / (months - 1),
    }
  })
}

function buildYearAxisLabels(start: Date, end: Date) {
  const labels: ActivityFlowAxisLabel[] = []
  for (let year = start.getFullYear(); year <= end.getFullYear(); year++) {
    const tick = localDate(year, 1, 1)
    const clamped = tick < start ? start : tick > end ? end : tick
    labels.push({
      text: String(year),
      position: positionOf(clamped, start, end),
    })
  }
  return labels
}

export function flowRecordsFromTimelineCards(
  cards: TimelineCard[],
): ActivityFlowRecord[] {
  return cards.flatMap((card) =>
    card.persons.map((person) => ({
      id: `${card.id}-${person.id}`,
      date: card.occurredDate,
      personId: person.id,
    })),
  )
}

/**
 * 등록된 사람별 레인에 기록 날짜(YYYY-MM-DD)를 연속 시간축 비율로 찍는다.
 */
export function buildPersonActivityFlow(
  persons: Array<{ id: number; name: string }>,
  records: ActivityFlowRecord[],
  period: ActivityFlowPeriod = '1Y',
  now = new Date(),
): ActivityFlowModel | null {
  if (persons.length === 0) return null

  const parsed = records
    .map((record) => {
      const date = parseIsoDate(record.date)
      if (!date) return null
      return { ...record, date }
    })
    .filter((v): v is ActivityFlowRecord & { date: Date } => v !== null)

  const window = resolveWindow(
    period,
    parsed.map((p) => p.date),
    now,
  )
  if (!window) return null

  const hasAnyActivity = parsed.some(
    (p) => p.date >= window.start && p.date <= window.end,
  )
  const axisMode = period === '1Y' ? 'month' : 'year'

  const lanes = persons.map((person) => {
    const points = parsed
      .filter(
        (p) =>
          p.personId === person.id &&
          p.date >= window.start &&
          p.date <= window.end,
      )
      .map((p) => ({
        id: p.id,
        date: formatIso(p.date),
        monthKey: monthKeyOf(p.date),
        position: positionOf(p.date, window.start, window.end),
      }))
      .sort((a, b) => a.position - b.position || a.date.localeCompare(b.date))

    return {
      personId: person.id,
      label: person.name,
      points,
    }
  })

  return {
    period,
    axisMode,
    lanes,
    axisLabels:
      axisMode === 'month'
        ? buildMonthAxisLabels(window.start, window.end)
        : buildYearAxisLabels(window.start, window.end),
    hasAnyActivity,
    quietMessage: hasAnyActivity
      ? null
      : period === '1Y'
        ? '올해는 아직 기록이 없어요'
        : period === 'ALL'
          ? '아직 기록이 없어요'
          : `최근 ${period === '5Y' ? '5' : '3'}년은 조용했어요`,
  }
}

export function flattenTimelineCards(groups: { cards: TimelineCard[] }[]) {
  return groups.flatMap((group) => group.cards)
}
