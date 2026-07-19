import { useMemo } from 'react'
import type { ReactNode, RefObject } from 'react'
import { formatEventDate } from '@/lib/format'
import { cn } from '@/lib/utils'

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
  const yearGroups = useMemo(() => {
    const groups: { year: string; items: T[] }[] = []

    for (const item of items) {
      const year = formatEventDate(item.occurredDate).year
      const lastGroup = groups.at(-1)
      if (lastGroup?.year === year) {
        lastGroup.items.push(item)
      } else {
        groups.push({ year, items: [item] })
      }
    }

    return groups
  }, [items])

  if (items.length === 0) return null

  return (
    <div className={cn('relative min-w-0 pb-20', scrollRootRef && 'pr-0.5')}>
      {yearGroups.map((group) => (
        <section key={group.year} className="relative">
          <div
            className={cn(
              'sticky z-10 mb-3 border-b border-border bg-background/95 py-3 backdrop-blur-sm',
              scrollRootRef
                ? 'top-0'
                : 'top-[max(2.5rem,env(safe-area-inset-top))] -mx-5 px-5',
            )}
          >
            <p className="inline-flex h-7 min-w-[4.375rem] items-center justify-center rounded-full bg-muted px-3 text-caption leading-tight font-extrabold text-muted-foreground">
              {group.year}
            </p>
          </div>
          {group.items.map((item) => {
            const { date } = formatEventDate(item.occurredDate)
            const [month, day] = date.split('.')
            return (
              <div key={item.id} className="mb-4 flex min-w-0 gap-3">
                <div className="flex w-[4.375rem] shrink-0 flex-col items-center">
                  <div className="flex size-10 flex-col items-center justify-center rounded-full border border-foreground bg-card text-[10px] leading-none font-extrabold shadow-[0_5px_16px_rgba(0,0,0,0.08)]">
                    <span>{month}</span>
                    <span>{day}</span>
                  </div>
                  <div className="w-px flex-1 border-l-2 border-dotted border-border/80" />
                </div>
                <div className="min-w-0 flex-1">{renderCard(item)}</div>
              </div>
            )
          })}
        </section>
      ))}
    </div>
  )
}
