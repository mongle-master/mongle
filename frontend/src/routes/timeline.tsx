import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronDown } from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { ActivityFlowChart } from '@/components/timeline/activity-flow-chart'
import {
  TimelineCategoryFilters,
  TimelineFilterReset,
  TimelinePersonFilters,
} from '@/components/timeline/timeline-filters'
import {
  fromTimelineCard,
  TimelineEventCard,
} from '@/components/timeline/timeline-event-card'
import { TimelineFeed } from '@/components/timeline/timeline-feed'
import { TimelineScrollShell } from '@/components/timeline/timeline-scroll-shell'
import { Button } from '@/components/ui/button'
import { fetchChips } from '@/lib/api/chips'
import { fetchMyTimeline } from '@/lib/api/timeline'
import { fetchPersons } from '@/lib/api/persons'
import { queryKeys } from '@/lib/query-keys'
import {
  flattenTimelineCards,
  flowRecordsFromTimelineCards,
  matchesActivityFlowSelection,
} from '@/lib/timeline-activity-flow'
import type { ActivityFlowSelection } from '@/lib/timeline-activity-flow'
import { recordSearch } from '@/lib/record-navigation'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/timeline')({
  component: MyTimelinePage,
})

function MyTimelinePage() {
  const scrollRef = useRef<HTMLDivElement>(null)
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [personFilter, setPersonFilter] = useState<number[]>([])
  const [flowSelection, setFlowSelection] =
    useState<ActivityFlowSelection | null>(null)
  const [isFilterOpen, setIsFilterOpen] = useState(false)

  // 활동 흐름은 필터 없는 전체 `/api/v1/timeline` 응답에서 파생한다.
  const allTimelineQuery = useQuery({
    queryKey: queryKeys.myTimeline([], []),
    queryFn: () => fetchMyTimeline(),
  })

  const timelineQuery = useQuery({
    queryKey: queryKeys.myTimeline(categoryFilter, personFilter),
    queryFn: () =>
      fetchMyTimeline({
        categoryChipIds: categoryFilter,
        personIds: personFilter,
      }),
  })

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => fetchChips(),
  })

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: () => fetchPersons(),
  })

  const categoryChips =
    chipsQuery.data?.filter((c) => c.type === 'CATEGORY') ?? []
  const persons = personsQuery.data ?? []

  const allCards = useMemo(
    () => flattenTimelineCards(allTimelineQuery.data?.groups ?? []),
    [allTimelineQuery.data],
  )
  const flowRecords = useMemo(
    () => flowRecordsFromTimelineCards(allCards),
    [allCards],
  )

  const cards = useMemo(() => {
    const list = flattenTimelineCards(timelineQuery.data?.groups ?? [])
    if (!flowSelection) return list
    return list.filter((card) =>
      matchesActivityFlowSelection(
        card.occurredDate,
        card.persons.map((person) => person.id),
        flowSelection,
      ),
    )
  }, [flowSelection, timelineQuery.data])

  const toggleCategory = (chipId: number) => {
    setCategoryFilter((prev) =>
      prev.includes(chipId)
        ? prev.filter((id) => id !== chipId)
        : [...prev, chipId],
    )
  }

  const togglePerson = (personId: number) => {
    setPersonFilter((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId],
    )
  }

  const hasFilter =
    categoryFilter.length > 0 ||
    personFilter.length > 0 ||
    flowSelection !== null
  const activeFilterCount =
    categoryFilter.length + personFilter.length + (flowSelection ? 1 : 0)

  const resetFilters = () => {
    setCategoryFilter([])
    setPersonFilter([])
    setFlowSelection(null)
  }

  return (
    <TimelineScrollShell
      activePath="/timeline"
      scrollRef={scrollRef}
      header={
        <>
          <MongleLogo className="mb-5 text-foreground" />
          <h1 className="text-[22px] font-extrabold tracking-tight">
            나의 몽글라인
          </h1>
          <p className="mt-1 text-xs text-muted-foreground">
            모든 사람과의 기록을 시간순으로
          </p>
        </>
      }
    >
      {allTimelineQuery.data && persons.length > 0 ? (
        <div className="mb-2">
          <ActivityFlowChart
            persons={persons}
            records={flowRecords}
            selectedPoint={flowSelection}
            onSelectPoint={setFlowSelection}
          />
        </div>
      ) : null}

      <div className="mb-4 px-1 py-2">
        <div className="flex items-center justify-between gap-3">
          <div>
            <p className="text-sm font-extrabold">필터</p>
          </div>
          <button
            type="button"
            onClick={() => setIsFilterOpen((open) => !open)}
            className="inline-flex h-9 shrink-0 items-center gap-1 rounded-full border border-border bg-background px-3 text-xs font-extrabold text-foreground transition-colors hover:bg-muted/60"
            aria-expanded={isFilterOpen}
          >
            {hasFilter ? (
              <span className="rounded-full bg-foreground px-1.5 py-0.5 text-[10px] leading-none text-background">
                {activeFilterCount}
              </span>
            ) : null}
            {isFilterOpen ? '접기' : '필터 열기'}
            <ChevronDown
              className={cn(
                'size-3 text-muted-foreground transition-transform',
                isFilterOpen && 'rotate-180',
              )}
              aria-hidden
            />
          </button>
        </div>
        {isFilterOpen ? (
          <div className="mt-3 border-t border-border/60 pt-3">
            <TimelineCategoryFilters
              chips={categoryChips}
              selectedIds={categoryFilter}
              onToggle={toggleCategory}
            />

            <TimelinePersonFilters
              persons={persons}
              selectedIds={personFilter}
              onToggle={togglePerson}
            />

            <TimelineFilterReset visible={hasFilter} onReset={resetFilters} />
          </div>
        ) : null}
      </div>

      {timelineQuery.isPending ? (
        <p className="py-12 text-center text-sm text-muted-foreground">
          타임라인을 불러오는 중…
        </p>
      ) : timelineQuery.isError ? (
        <p className="py-12 text-center text-sm text-destructive">
          타임라인을 불러오지 못했어요.
        </p>
      ) : cards.length === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilter
              ? '이 조건에 맞는 기록이 없어요.'
              : persons.length === 0
                ? '먼저 함께한 사람을 추가해 주세요.'
                : '아직 함께한 기록이 없어요. 첫 순간을 새겨보세요.'}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link
              to={persons.length === 0 ? '/people/new' : '/record'}
              search={recordSearch({})}
            >
              {persons.length === 0 ? '＋ 사람 추가' : '기록 작성'}
            </Link>
          </Button>
        </div>
      ) : (
        <TimelineFeed
          scrollRootRef={scrollRef}
          items={cards}
          renderCard={(card) => (
            <TimelineEventCard
              item={fromTimelineCard(card)}
              returnTo="timeline"
            />
          )}
        />
      )}
    </TimelineScrollShell>
  )
}
