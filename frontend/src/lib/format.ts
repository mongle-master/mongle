export function monogram(name: string) {
  const ch = name.trim().charAt(0)
  return ch ? (/[a-z]/i.test(ch) ? ch.toUpperCase() : ch) : '?'
}

export type PersonNameSource = {
  name?: string | null
  fullName?: string | null
  familyName?: string | null
  givenName?: string | null
  lastName?: string | null
  firstName?: string | null
}

export function formatPersonName(person: PersonNameSource) {
  const fullName = person.fullName?.trim()
  if (fullName) return fullName

  const familyName = (person.familyName ?? person.lastName)?.trim()
  const givenName = (person.givenName ?? person.firstName)?.trim()
  const name = person.name?.trim() ?? ''

  if (familyName && givenName) return `${familyName}${givenName}`
  if (familyName && name && !name.startsWith(familyName)) {
    return `${familyName}${name}`
  }

  return name || givenName || familyName || ''
}

function hangulHasBatchim(char: string) {
  const code = char.codePointAt(0)
  if (code === undefined || code < 0xac00 || code > 0xd7a3) return false
  return (code - 0xac00) % 28 !== 0
}

/** 이름 끝 받침 유무에 따라 '와' | '과' (예: 지수와, 재윤과) */
export function pickWaGa(word: string): '와' | '과' {
  const trimmed = word.trim()
  if (!trimmed) return '와'
  const last = [...trimmed].at(-1) ?? ''
  return hangulHasBatchim(last) ? '과' : '와'
}

/** 백엔드 autoTitle(#37)과 동일 — placeholder·조회 표시 drift 방지 */
export function formatAutoEventTitle(
  persons: { name: string }[],
  categoryLabel: string,
): string | null {
  const category = categoryLabel.trim()
  const representative = persons[0]?.name.trim()
  if (!representative || !category) return null
  const others = persons.length - 1
  const who = others > 0 ? `${representative} 외 ${others}명` : representative
  return `${who} · ${category}`
}

/** 로컬 자정 기준 오늘 날짜('YYYY-MM-DD'). toISOString()은 UTC라 KST 00~09시엔 하루 전으로 밀린다 */
export function todayLocalIso(date = new Date()) {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

export function formatEventDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return { year: y, date: `${m}.${d}` }
}

export function formatWhen(iso: string, time?: string | null) {
  const [y, m, d] = iso.split('-')
  const weekdays = ['일', '월', '화', '수', '목', '금', '토']
  const day = new Date(Number(y), Number(m) - 1, Number(d)).getDay()
  const base = `${y}.${m}.${d} (${weekdays[day]})`
  if (!time) return base
  return `${base} ${time.slice(0, 5)}`
}

export function formatAbsoluteDate(iso: string) {
  const [y, m, d] = iso.split('-')
  return `${y}. ${Number(m)}. ${Number(d)}.`
}

export function formatBirthday(
  birthday: { year?: number; month?: number; day?: number } | null,
) {
  if (!birthday?.month || !birthday.day) return null
  const label = birthday.year
    ? `${birthday.year}년 ${birthday.month}월 ${birthday.day}일`
    : `${birthday.month}월 ${birthday.day}일`
  const daysUntil = daysUntilNextBirthday({
    month: birthday.month,
    day: birthday.day,
    year: birthday.year,
  })
  return `${label} · D-${daysUntil}`
}

export function daysUntilNextBirthday(birthday: {
  year?: number
  month: number
  day: number
}) {
  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  let next = new Date(now.getFullYear(), birthday.month - 1, birthday.day)
  if (next < today) {
    next = new Date(now.getFullYear() + 1, birthday.month - 1, birthday.day)
  }
  const diff = Math.round(
    (next.getTime() - today.getTime()) / (1000 * 60 * 60 * 24),
  )
  return diff
}

export function formatDaysSinceFirstMet(days: number | null | undefined) {
  if (days == null) return null
  return `${days + 1}일째`
}

export function daysSinceDate(iso: string, today = new Date()) {
  const [y, m, d] = iso.split('-').map(Number)
  const target = new Date(y, m - 1, d)
  const todayStart = new Date(
    today.getFullYear(),
    today.getMonth(),
    today.getDate(),
  )
  return Math.round(
    (todayStart.getTime() - target.getTime()) / (1000 * 60 * 60 * 24),
  )
}

export function formatLastMetRelative(lastMetDate: string | null | undefined) {
  if (!lastMetDate) return '기록 없음'
  const days = daysSinceDate(lastMetDate)
  if (days <= 0) return '오늘'
  if (days === 1) return '어제'
  if (days < 7) return `${days}일 전`
  if (days < 14) return '1주 전'
  if (days < 30) return `${Math.max(2, Math.round(days / 7))}주 전`
  if (days < 45) return '1개월 전'
  return `${Math.max(2, Math.round(days / 30))}개월 전`
}

export function layoutOnCircle(count: number, cx = 50, cy = 52, radius = 35) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}

/** 인물 노드 + 사람 추가 버튼이 링 위에서 겹치지 않도록 슬롯을 나눈다. */
export function layoutRelationMap(
  personCount: number,
  cx = 50,
  cy = 52,
  radius = 35,
) {
  const totalSlots = personCount + 1
  const slots = Array.from({ length: totalSlots }, (_, i) => {
    const angle = (2 * Math.PI * i) / totalSlots - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
  return {
    persons: slots.slice(0, personCount),
    add: slots[totalSlots - 1],
  }
}
