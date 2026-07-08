import { useEffect, useRef, useState } from 'react'
import type { ReactNode, RefObject } from 'react'
import { formatEventDate } from '@/lib/format'
import { cn } from '@/lib/utils'

const SCROLL_YEAR_MARKER = 100

type TimelineFeedItem = { id: number; occurredDate: string }

export function TimelineFeed<T extends TimelineFeedItem>({
  items,
  renderCard,
  scrollRootRef,
}: {
  items: T[]
  renderCard: (item: T) => ReactNode
  scrollRootRef?: RefObject<HTMLElement | null>
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

    const root = scrollRootRef?.current
    const target: HTMLElement | Window = root ?? window
    target.addEventListener('scroll', updateYear, { passive: true })
    updateYear()
    return () => target.removeEventListener('scroll', updateYear)
  }, [items, scrollRootRef])

  if (items.length === 0) return null

  return (
    <div className={cn('relative min-w-0 pb-20', scrollRootRef && 'pr-0.5')}>
      <div
        className={cn(
          'sticky z-10 mb-2 bg-background/95 py-1 backdrop-blur-sm',
          scrollRootRef
            ? 'top-0'
            : 'top-[max(2.5rem,env(safe-area-inset-top))] -mx-5 px-5',
        )}
      >
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
            className="mb-4 flex min-w-0 gap-2"
          >
            <div className="flex w-[4.375rem] shrink-0 flex-col items-center">
              <div className="flex size-8 flex-col items-center justify-center rounded-full border border-foreground bg-card text-[10px] leading-none font-extrabold">
                <span>{month}</span>
                <span>{day}</span>
              </div>
              <div className="w-px flex-1 border-l-2 border-dotted border-border" />
            </div>
            <div className="min-w-0 flex-1">{renderCard(item)}</div>
          </div>
        )
      })}
    </div>
  )
}
