export type HomePeriod = 'ALL' | '5Y' | '3Y' | '1Y' | '1M'

export const HOME_PERIOD_STORAGE_KEY = 'mongle:home-default-period:v1'

export const HOME_PERIOD_OPTIONS: Array<{ value: HomePeriod; label: string }> =
  [
    { value: 'ALL', label: '전체' },
    { value: '5Y', label: '5년' },
    { value: '3Y', label: '3년' },
    { value: '1Y', label: '1년' },
    { value: '1M', label: '1개월' },
  ]

const PERIOD_MAX_DAYS: Record<Exclude<HomePeriod, 'ALL'>, number> = {
  '5Y': 365 * 5,
  '3Y': 365 * 3,
  '1Y': 365,
  '1M': 30,
}

export function isHomePeriod(value: string): value is HomePeriod {
  return HOME_PERIOD_OPTIONS.some((o) => o.value === value)
}

export function getDefaultHomePeriod(): HomePeriod {
  try {
    const stored = localStorage.getItem(HOME_PERIOD_STORAGE_KEY)
    if (stored && isHomePeriod(stored)) return stored
  } catch {
    // private browsing 등
  }
  return 'ALL'
}

export function setDefaultHomePeriod(period: HomePeriod) {
  try {
    localStorage.setItem(HOME_PERIOD_STORAGE_KEY, period)
  } catch {
    // ignore
  }
}

export function isNodeInHomePeriod(
  daysSinceLastMeet: number | null | undefined,
  period: HomePeriod,
) {
  if (period === 'ALL') return true
  if (daysSinceLastMeet == null) return false
  return daysSinceLastMeet <= PERIOD_MAX_DAYS[period]
}
