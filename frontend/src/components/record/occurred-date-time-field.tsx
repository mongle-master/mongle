import { useState } from 'react'
import { Calendar as CalendarIcon, Clock, X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Calendar } from '@/components/ui/calendar'
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { cn } from '@/lib/utils'

const WEEKDAYS = ['일', '월', '화', '수', '목', '금', '토']
const HOURS = Array.from({ length: 24 }, (_, i) => String(i).padStart(2, '0'))
const MINUTES = Array.from({ length: 12 }, (_, i) =>
  String(i * 5).padStart(2, '0'),
)

// occurredDate('YYYY-MM-DD')는 로컬 달력일 — UTC 변환(new Date(iso), toISOString) 없이 문자열<->Date를 직접 다룬다
function parseLocalDate(iso: string): Date | undefined {
  if (!iso) return undefined
  const [y, m, d] = iso.split('-').map(Number)
  if (!y || !m || !d) return undefined
  return new Date(y, m - 1, d)
}

function formatLocalDate(date: Date): string {
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}

function formatDateLabel(iso: string): string {
  const date = parseLocalDate(iso)
  if (!date) return '날짜 선택'
  return `${date.getMonth() + 1}월 ${date.getDate()}일 (${WEEKDAYS[date.getDay()]})`
}

function startOfToday(): Date {
  const now = new Date()
  return new Date(now.getFullYear(), now.getMonth(), now.getDate())
}

export function OccurredDateTimeField({
  date,
  time,
  onDateChange,
  onTimeChange,
  className,
}: {
  /** 'YYYY-MM-DD' */
  date: string
  /** 'HH:MM' | '' (선택값) */
  time: string
  onDateChange: (iso: string) => void
  onTimeChange: (value: string) => void
  className?: string
}) {
  const [datePopoverOpen, setDatePopoverOpen] = useState(false)
  const selectedDate = parseLocalDate(date)
  const [hour, minute] = time ? time.split(':') : ['', '']

  const commitTime = (nextHour: string, nextMinute: string) => {
    onTimeChange(`${nextHour}:${nextMinute}`)
  }

  return (
    <div className={cn('flex gap-2', className)}>
      <Popover open={datePopoverOpen} onOpenChange={setDatePopoverOpen}>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="flex-1 justify-start gap-1.5 text-xs font-normal md:text-xs"
          >
            <CalendarIcon className="size-3.5 text-muted-foreground" />
            {formatDateLabel(date)}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="start">
          <Calendar
            mode="single"
            selected={selectedDate}
            defaultMonth={selectedDate}
            disabled={{ after: startOfToday() }}
            onSelect={(next) => {
              if (!next) return
              onDateChange(formatLocalDate(next))
              setDatePopoverOpen(false)
            }}
          />
        </PopoverContent>
      </Popover>

      <Popover>
        <PopoverTrigger asChild>
          <Button
            type="button"
            variant="outline"
            className="w-[7rem] justify-start gap-1.5 text-xs font-normal md:text-xs"
          >
            <Clock className="size-3.5 text-muted-foreground" />
            {time || '시간'}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto" align="end">
          <div className="flex items-center gap-1.5">
            <Select
              value={hour}
              onValueChange={(next) => commitTime(next, minute || '00')}
            >
              <SelectTrigger size="sm" className="text-xs">
                <SelectValue placeholder="시" />
              </SelectTrigger>
              <SelectContent
                className="max-h-56"
                style={{ maxHeight: '14rem' }}
              >
                {HOURS.map((h) => (
                  <SelectItem key={h} value={h}>
                    {h}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <span className="text-muted-foreground">:</span>
            <Select
              value={minute}
              onValueChange={(next) => commitTime(hour || '00', next)}
            >
              <SelectTrigger size="sm" className="text-xs">
                <SelectValue placeholder="분" />
              </SelectTrigger>
              <SelectContent
                className="max-h-56"
                style={{ maxHeight: '14rem' }}
              >
                {MINUTES.map((m) => (
                  <SelectItem key={m} value={m}>
                    {m}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {time ? (
              <Button
                type="button"
                variant="ghost"
                size="icon-sm"
                aria-label="시간 지우기"
                onClick={() => onTimeChange('')}
              >
                <X className="size-3.5" />
              </Button>
            ) : null}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
