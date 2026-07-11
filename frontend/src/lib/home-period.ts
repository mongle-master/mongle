export type HomePeriod = 'ALL' | '5Y' | '3Y' | '1Y' | '1M'

/** 설정 탭 "홈에서 기본으로 보여줄 기간" 전용. 홈 탭에서 바꾼 기간은 저장하지 않는다. */
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

type HomePeriodListener = (period: HomePeriod) => void

const listeners = new Set<HomePeriodListener>()

/**
 * Main activity가 방문한 탭을 hidden으로만 유지해 홈 탭이 리마운트되지 않으므로,
 * 설정 탭에서 기본 기간을 바꾸면 구독으로 즉시 전달해야 한다.
 */
export function subscribeDefaultHomePeriod(listener: HomePeriodListener) {
  listeners.add(listener)
  return () => {
    listeners.delete(listener)
  }
}

export function setDefaultHomePeriod(period: HomePeriod) {
  try {
    localStorage.setItem(HOME_PERIOD_STORAGE_KEY, period)
  } catch {
    // ignore
  }
  listeners.forEach((listener) => listener(period))
}

function daysSinceLocalDate(isoDate: string, today = new Date()) {
  const [y, m, d] = isoDate.split('-').map(Number)
  const then = new Date(y, m - 1, d)
  const now = new Date(today.getFullYear(), today.getMonth(), today.getDate())
  return Math.floor((now.getTime() - then.getTime()) / (1000 * 60 * 60 * 24))
}

/** 처음 만난 날이 설정 기간 안에 있는 인물만 홈에 표시한다. 날짜 없으면 기간 필터 시 제외. */
export function isPersonInHomePeriod(
  firstMetDate: string | null | undefined,
  period: HomePeriod,
) {
  if (period === 'ALL') return true
  if (!firstMetDate) return false
  const days = daysSinceLocalDate(firstMetDate)
  return days >= 0 && days <= PERIOD_MAX_DAYS[period]
}
