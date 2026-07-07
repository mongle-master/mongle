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

export function layoutOnCircle(count: number, cx = 50, cy = 52, radius = 35) {
  return Array.from({ length: count }, (_, i) => {
    const angle = (2 * Math.PI * i) / Math.max(count, 1) - Math.PI / 2
    return {
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle),
    }
  })
}
