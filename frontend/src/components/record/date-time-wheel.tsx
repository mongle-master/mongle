import { useEffect, useRef } from 'react'
import Picker from 'react-mobile-picker'
import type { PickerValue } from 'react-mobile-picker'
import { cn } from '@/lib/utils'

// 네이티브 date/time 대신: 날짜는 가로 슬라이드 스트립, 시간은 휠 피커.
// 모든 날짜 계산은 UTC 기준(occurredDate 기본값·검증과 동일 방식)으로 통일한다.

const pad = (n: number) => String(n).padStart(2, '0')
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
  const today = new Date().toISOString().slice(0, 10)
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

// 시간은 24시간제(오전/오후 열 없이). 한 번에 5칸(가운데+위아래 2칸).
const ITEM_H = 40
const HEIGHT = 5 * ITEM_H
const HOURS24 = Array.from({ length: 24 }, (_, i) => String(i))
const MINUTES = Array.from({ length: 12 }, (_, i) => pad(i * 5))

function currentTime() {
  const now = new Date()
  return `${pad(now.getHours())}:${pad(Math.floor(now.getMinutes() / 5) * 5)}`
}

function parseTime(v: string): PickerValue {
  if (!v) return { hour: '9', minute: '00' }
  const [H, M] = v.split(':').map(Number)
  return { hour: String(H), minute: pad(Math.floor(M / 5) * 5) }
}
function toTime(pv: PickerValue) {
  return `${pad(Number(pv.hour))}:${pv.minute}`
}

function Item({ label }: { label: string }) {
  return (
    <Picker.Item value={label}>
      {({ selected }: { selected: boolean }) => (
        <span
          className={cn(
            'tabular-nums transition-all',
            selected
              ? 'text-2xl font-bold text-foreground/75'
              : 'text-base text-muted-foreground/40',
          )}
        >
          {label}
        </span>
      )}
    </Picker.Item>
  )
}

export function TimeWheel({
  value,
  onChange,
}: {
  value: string
  onChange: (v: string) => void
}) {
  const unknown = value === ''
  const pv = parseTime(value)
  return (
    <div>
      <div className="mb-4 grid grid-cols-2 rounded-xl bg-muted/40 p-1">
        <button
          type="button"
          aria-pressed={!unknown}
          onClick={() => {
            if (unknown) onChange(currentTime())
          }}
          className={cn(
            'rounded-lg px-3 py-2 text-sm transition-colors',
            !unknown
              ? 'bg-background font-semibold text-foreground shadow-sm'
              : 'text-muted-foreground',
          )}
        >
          시간 입력
        </button>
        <button
          type="button"
          aria-pressed={unknown}
          onClick={() => onChange('')}
          className={cn(
            'rounded-lg px-3 py-2 text-sm transition-colors',
            unknown
              ? 'bg-background font-semibold text-foreground shadow-sm'
              : 'text-muted-foreground',
          )}
        >
          시간 모름
        </button>
      </div>
      {!unknown && (
        <>
          <div className="mb-1.5 flex gap-3 px-2">
            <span className="flex-1 text-center text-xs text-muted-foreground">
              시
            </span>
            <span className="flex-1 text-center text-xs text-muted-foreground">
              분
            </span>
          </div>
          <Picker
            value={pv}
            onChange={(next) => onChange(toTime(next))}
            height={HEIGHT}
            itemHeight={ITEM_H}
            wheelMode="natural"
            className="gap-3"
          >
            <Picker.Column name="hour" className="rounded-2xl bg-muted/40">
              {HOURS24.map((v) => (
                <Item key={v} label={v} />
              ))}
            </Picker.Column>
            <Picker.Column name="minute" className="rounded-2xl bg-muted/40">
              {MINUTES.map((v) => (
                <Item key={v} label={v} />
              ))}
            </Picker.Column>
          </Picker>
        </>
      )}
    </div>
  )
}
