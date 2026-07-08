import { useEffect, useRef, useState } from 'react'
import type { ReactNode } from 'react'
import { formatEventDate } from '@/lib/format'

const SCROLL_YEAR_MARKER = 100

type TimelineFeedItem = { id: number; occurredDate: string }

export function TimelineFeed<T extends TimelineFeedItem>({
  items,
  renderCard,
}: {
  items: T[]
  renderCard: (item: T) => ReactNode
}) {
  const [activeYear, setActiveYear] = useState('')
  const rowRefs = useRef(new Map<number, HTMLElement>())

  useEffect(() => {
    if (items.length === 0) {
      setActiveYear('')
      return
    }
    setActiveYear(formatEventDate(items[0].occurredDate).year)
  }, [items])

  useEffect(() => {
    if (items.length === 0) return

    const updateYear = () => {
      let year = formatEventDate(items[0].occurredDate).year
      for (const item of items) {
        const el = rowRefs.current.get(item.id)
        if (el && el.getBoundingClientRect().top <= SCROLL_YEAR_MARKER) {
          year = formatEventDate(item.occurredDate).year
        }
      }
      setActiveYear(year)
    }

    window.addEventListener('scroll', updateYear, { passive: true })
    updateYear()
    return () => window.removeEventListener('scroll', updateYear)
  }, [items])

  if (items.length === 0) return null

  return (
    <div className="relative pb-20">
      <div className="sticky top-[max(2.5rem,env(safe-area-inset-top))] z-10 -mx-5 mb-2 bg-background/95 px-5 py-1 backdrop-blur-sm">
        <p className="w-[4.375rem] text-center text-[10.5px] leading-tight font-extrabold text-muted-foreground">
          {activeYear}
        </p>
      </div>
      {items.map((item) => {
        const { date } = formatEventDate(item.occurredDate)
        const [month, day] = date.split('.')
        return (
          <div
            key={item.id}
            ref={(el) => {
              if (el) rowRefs.current.set(item.id, el)
              else rowRefs.current.delete(item.id)
            }}
            className="mb-4 flex gap-2"
          >
            <div className="flex w-[4.375rem] shrink-0 flex-col items-center">
              <div className="flex size-8 flex-col items-center justify-center rounded-full border border-foreground bg-card text-[10px] leading-none font-extrabold">
                <span>{month}</span>
                <span>{day}</span>
              </div>
              <div className="w-px flex-1 border-l-2 border-dotted border-border" />
            </div>
            {renderCard(item)}
          </div>
        )
      })}
    </div>
  )
}
