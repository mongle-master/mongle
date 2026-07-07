export function monogram(name: string) {
  const ch = name.trim().charAt(0)
  return ch ? (/[a-z]/i.test(ch) ? ch.toUpperCase() : ch) : '?'
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
  const label = `${birthday.month}월 ${birthday.day}일`
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

export function layoutOnCircle(count: number, cx = 50, cy = 52, radius = 35) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}
