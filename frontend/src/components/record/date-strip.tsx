import { useEffect, useRef } from 'react'
import { pad, todayLocalIso } from '@/lib/format'
import { cn } from '@/lib/utils'

// 네이티브 date 대신 날짜를 가로 슬라이드 스트립으로 고른다.
// '오늘'은 로컬 달력일(todayLocalIso) 기준 — occurredDate 기본값·검증과 동일 방식.
// 날짜 문자열 연산(isoBack·요일)은 타임존 영향이 없도록 UTC 고정으로 계산한다.

const WEEKDAY = ['일', '월', '화', '수', '목', '금', '토']

function isoBack(baseIso: string, back: number) {
  const d = new Date(`${baseIso}T00:00:00Z`)
  d.setUTCDate(d.getUTCDate() - back)
  return d.toISOString().slice(0, 10)
}

// 오늘부터 과거 30일. 좌(과거) → 우(오늘), 좌로 슬라이드하면 더 과거로.
export function DateStrip({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const scrollRef = useRef<HTMLDivElement>(null)
  const today = todayLocalIso()
  const days = Array.from({ length: 30 }, (_, k) => {
    const back = 29 - k
    const iso = isoBack(today, back)
    const dow = WEEKDAY[new Date(`${iso}T00:00:00Z`).getUTCDay()]
    const top = back === 0 ? '오늘' : back === 1 ? '어제' : dow
    return { iso, top, day: pad(Number(iso.slice(8, 10))) }
  })

  // 진입 시 오늘(맨 오른쪽)이 보이도록 스크롤 끝으로.
  useEffect(() => {
    const el = scrollRef.current
    if (el) el.scrollLeft = el.scrollWidth
  }, [])

  return (
    <div
      ref={scrollRef}
      className="-mx-5 flex gap-2 overflow-x-auto px-5 pb-1 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
    >
      {days.map((d) => {
        const selected = d.iso === value
        return (
          <button
            key={d.iso}
            type="button"
            onClick={() => onChange(d.iso)}
            className={cn(
              'flex h-[4.5rem] w-14 shrink-0 flex-col items-center justify-center gap-1.5 rounded-2xl border transition-colors',
              selected
                ? 'border-transparent bg-foreground/85 text-background'
                : 'border-border bg-card text-foreground/70',
            )}
          >
            <span className="text-xs">{d.top}</span>
            <span className="text-xl font-semibold tabular-nums">{d.day}</span>
          </button>
        )
      })}
    </div>
  )
}
