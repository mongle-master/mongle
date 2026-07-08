import { useEffect, useMemo, useRef, useState } from 'react'
import { cn } from '@/lib/utils'

const ITEM_HEIGHT = 40

function daysInMonth(year: number, month: number) {
  if (!year || !month) return 31
  return new Date(year, month, 0).getDate()
}

function clampDay(year: string, month: string, day: string) {
  if (!day) return day
  const y = Number(year) || new Date().getFullYear()
  const m = Number(month) || 1
  const max = daysInMonth(y, m)
  return String(Math.min(Number(day), max))
}

type OpenField = 'year' | 'month' | 'day' | null

function DatePartField({
  placeholder,
  value,
  displayValue,
  required,
  open,
  onOpen,
  onClose,
  items,
  onSelect,
}: {
  placeholder: string
  value: string
  displayValue?: string
  required?: boolean
  open: boolean
  onOpen: () => void
  onClose: () => void
  items: number[]
  onSelect: (value: string) => void
}) {
  const listRef = useRef<HTMLDivElement>(null)
  const selected = value ? Number(value) : null

  useEffect(() => {
    if (!open || selected == null || !listRef.current) return
    const index = items.indexOf(selected)
    if (index < 0) return
    listRef.current.scrollTop = Math.max(0, index * ITEM_HEIGHT - ITEM_HEIGHT)
  }, [open, items, selected])

  return (
    <div className="relative min-w-0">
      <button
        type="button"
        onClick={onOpen}
        className="flex h-8 w-full items-center justify-start rounded-lg border border-input bg-transparent px-2.5 text-left text-sm outline-none"
        aria-expanded={open}
      >
        {value ? (
          <span className="font-medium text-foreground">
            {displayValue ?? value}
          </span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-muted-foreground">
            {placeholder}
            {required ? (
              <span
                className="inline-block size-1.5 rounded-full bg-destructive"
                aria-hidden
              />
            ) : null}
          </span>
        )}
      </button>

      {open ? (
        <div
          ref={listRef}
          className="absolute top-[calc(100%+4px)] right-0 left-0 z-50 max-h-44 overflow-y-auto rounded-lg border border-border bg-background shadow-lg"
          role="listbox"
        >
          {items.map((item) => {
            const active = String(item) === value
            return (
              <button
                key={item}
                type="button"
                role="option"
                aria-selected={active}
                onClick={() => {
                  onSelect(String(item))
                  onClose()
                }}
                className={cn(
                  'flex h-10 w-full items-center justify-start px-2.5 text-left text-sm',
                  active
                    ? 'bg-muted font-extrabold text-foreground'
                    : 'text-foreground hover:bg-muted/60',
                )}
              >
                {item}
              </button>
            )
          })}
        </div>
      ) : null}
    </div>
  )
}

export function DatePartPicker({
  year,
  month,
  day,
  onChange,
  yearRequired = false,
}: {
  year: string
  month: string
  day: string
  onChange: (next: { year: string; month: string; day: string }) => void
  yearRequired?: boolean
}) {
  const [openField, setOpenField] = useState<OpenField>(null)
  const rootRef = useRef<HTMLDivElement>(null)

  const currentYear = new Date().getFullYear()
  const years = useMemo(
    () =>
      Array.from({ length: currentYear - 1900 + 1 }, (_, i) => currentYear - i),
    [currentYear],
  )
  const months = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), [])

  const yearNum = Number(year) || currentYear
  const monthNum = Number(month) || 1
  const days = useMemo(
    () =>
      Array.from({ length: daysInMonth(yearNum, monthNum) }, (_, i) => i + 1),
    [yearNum, monthNum],
  )

  useEffect(() => {
    if (!openField) return

    const handlePointerDown = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node
      if (!rootRef.current?.contains(target)) {
        setOpenField(null)
      }
    }

    document.addEventListener('mousedown', handlePointerDown)
    document.addEventListener('touchstart', handlePointerDown)
    return () => {
      document.removeEventListener('mousedown', handlePointerDown)
      document.removeEventListener('touchstart', handlePointerDown)
    }
  }, [openField])

  const toggle = (field: OpenField) => {
    setOpenField((prev) => (prev === field ? null : field))
  }

  return (
    <div ref={rootRef} className="mt-1.5 grid grid-cols-3 gap-2">
      <DatePartField
        placeholder="연도"
        value={year}
        required={yearRequired}
        open={openField === 'year'}
        onOpen={() => toggle('year')}
        onClose={() => setOpenField(null)}
        items={years}
        onSelect={(nextYear) =>
          onChange({
            year: nextYear,
            month,
            day: clampDay(nextYear, month, day),
          })
        }
      />
      <DatePartField
        placeholder="월"
        value={month}
        open={openField === 'month'}
        onOpen={() => toggle('month')}
        onClose={() => setOpenField(null)}
        items={months}
        onSelect={(nextMonth) =>
          onChange({
            year,
            month: nextMonth,
            day: clampDay(year, nextMonth, day),
          })
        }
      />
      <DatePartField
        placeholder="일"
        value={day}
        open={openField === 'day'}
        onOpen={() => toggle('day')}
        onClose={() => setOpenField(null)}
        items={days}
        onSelect={(nextDay) =>
          onChange({
            year,
            month,
            day: nextDay,
          })
        }
      />
    </div>
  )
}
