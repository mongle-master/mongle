import { useQuery } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import { useMemo, useRef, useState } from 'react'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { ActivityFlowChart } from '@/components/timeline/activity-flow-chart'
import { TimelineFilterDrawer } from '@/components/timeline/timeline-filter-drawer'
import {
  fromTimelineCard,
  TimelineEventCard,
} from '@/components/timeline/timeline-event-card'
import { TimelineFeed } from '@/components/timeline/timeline-feed'
import { TimelineScrollShell } from '@/components/timeline/timeline-scroll-shell'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/page-title'
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
} from '@/components/ui/empty-state'
import { StatusMessage } from '@/components/ui/status-message'
import { chipQuery, personQuery, timelineQuery } from '@/apis/queries'
import {
  flattenTimelineCards,
  flowRecordsFromTimelineCards,
  matchesActivityFlowSelection,
} from '@/lib/timeline-activity-flow'
import type { ActivityFlowSelection } from '@/lib/timeline-activity-flow'
import { TabShell } from '@/stackflow/components/tab-shell'
import { featureEvents, trackFeature } from '@/lib/analytics'

export function TimelineTab() {
  const { push } = useFlow()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [personFilter, setPersonFilter] = useState<number[]>([])
  const [flowSelection, setFlowSelection] =
    useState<ActivityFlowSelection | null>(null)

  // 활동 흐름은 필터 없는 전체 `/api/v1/timeline` 응답에서 파생한다.
  const allTimelineQuery = useQuery(timelineQuery.list())

  // 필터 토글마다 queryKey가 바뀌는데, 이전 데이터를 유지하지 않으면
  // 새 키의 isPending 동안 피드 전체가 로딩 문구로 교체되어 화면이 깜빡인다.
  const filteredTimelineQuery = useQuery(
    timelineQuery.list(categoryFilter, personFilter),
  )

  const chipsQuery = useQuery(chipQuery.all())

  const personsQuery = useQuery(personQuery.all())

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
    const list = flattenTimelineCards(filteredTimelineQuery.data?.groups ?? [])
    if (!flowSelection) return list
    return list.filter((card) =>
      matchesActivityFlowSelection(
        card.occurredDate,
        card.persons.map((person) => person.id),
        flowSelection,
      ),
    )
  }, [filteredTimelineQuery.data, flowSelection])

  const toggleCategory = (chipId: number) => {
    setCategoryFilter((prev) => {
      const enabled = !prev.includes(chipId)
      void trackFeature(featureEvents.timelineFilterChanged, {
        filter_type: 'category',
        enabled,
      })
      return enabled ? [...prev, chipId] : prev.filter((id) => id !== chipId)
    })
  }

  const togglePerson = (personId: number) => {
    setPersonFilter((prev) => {
      const enabled = !prev.includes(personId)
      void trackFeature(featureEvents.timelineFilterChanged, {
        filter_type: 'person',
        enabled,
      })
      return enabled
        ? [...prev, personId]
        : prev.filter((id) => id !== personId)
    })
  }

  const hasFilter =
    categoryFilter.length > 0 ||
    personFilter.length > 0 ||
    flowSelection !== null
  const activeFilterCount =
    categoryFilter.length + personFilter.length + (flowSelection ? 1 : 0)

  const resetFilters = () => {
    if (!hasFilter) return
    setCategoryFilter([])
    setPersonFilter([])
    setFlowSelection(null)
    void trackFeature(featureEvents.timelineFiltersReset)
  }

  const handleFlowSelection = (next: ActivityFlowSelection | null) => {
    setFlowSelection(next)
    if (next) {
      void trackFeature(featureEvents.timelineActivityFlowSelected)
    }
  }

  return (
    <TabShell layout="fixed">
      <TimelineScrollShell
        scrollRef={scrollRef}
        header={
          <>
            <MongleLogo className="mb-5 text-foreground" />
            <PageTitle>나의 몽글라인</PageTitle>
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
              onSelectPoint={handleFlowSelection}
            />
          </div>
        ) : null}

        <div className="px-1 py-2">
          <div className="flex items-center justify-between gap-3">
            <p className="text-sm font-extrabold">필터</p>
            <TimelineFilterDrawer
              categoryChips={categoryChips}
              persons={persons}
              selectedCategoryIds={categoryFilter}
              selectedPersonIds={personFilter}
              activeFilterCount={activeFilterCount}
              hasFilter={hasFilter}
              onToggleCategory={toggleCategory}
              onTogglePerson={togglePerson}
              onReset={resetFilters}
            />
          </div>
        </div>

        {filteredTimelineQuery.isPending ? (
          <StatusMessage inset="list">타임라인을 불러오는 중…</StatusMessage>
        ) : filteredTimelineQuery.isError ? (
          <StatusMessage tone="error" inset="list">
            타임라인을 불러오지 못했어요.
          </StatusMessage>
        ) : cards.length === 0 ? (
          <EmptyState className="py-12">
            <EmptyStateDescription>
              {hasFilter
                ? '이 조건에 맞는 기록이 없어요.'
                : persons.length === 0
                  ? '먼저 함께한 사람을 추가해 주세요.'
                  : '아직 함께한 기록이 없어요. 첫 순간을 새겨보세요.'}
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button
                variant="outline"
                onClick={() =>
                  persons.length === 0
                    ? push('PersonNew', {})
                    : push('Record', {})
                }
              >
                {persons.length === 0 ? '＋ 사람 추가' : '기록 작성'}
              </Button>
            </EmptyStateAction>
          </EmptyState>
        ) : (
          <TimelineFeed
            scrollRootRef={scrollRef}
            items={cards}
            renderCard={(card) => (
              <TimelineEventCard item={fromTimelineCard(card)} />
            )}
          />
        )}
      </TimelineScrollShell>
    </TabShell>
  )
}
