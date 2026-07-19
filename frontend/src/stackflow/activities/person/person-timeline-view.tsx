import { useQuery } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import { useMemo, useRef, useState } from 'react'
import { ActivityFlowChart } from '@/components/timeline/activity-flow-chart'
import { TimelineCategoryFilters } from '@/components/timeline/timeline-category-filters'
import { TimelineFilterReset } from '@/components/timeline/timeline-filter-reset'
import {
  fromEventResponse,
  TimelineEventCard,
} from '@/components/timeline/timeline-event-card'
import { TimelineFeed } from '@/components/timeline/timeline-feed'
import { TimelineScrollShell } from '@/components/timeline/timeline-scroll-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Button } from '@/components/ui/button'
import { PageTitle } from '@/components/ui/page-title'
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
} from '@/components/ui/empty-state'
import { ListGroup } from '@/components/ui/list-group'
import { ListGroupItem } from '@/components/ui/list-group-item'
import { StatusMessage } from '@/components/ui/status-message'
import { chipQuery, eventQuery, personQuery } from '@/apis/queries'
import { formatPersonName } from '@/lib/format'
import { matchesActivityFlowSelection } from '@/lib/timeline-activity-flow'
import type { ActivityFlowSelection } from '@/lib/timeline-activity-flow'

export function PersonTimelineView({ personId }: { personId: string }) {
  const id = Number(personId)
  const { push } = useFlow()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [flowSelection, setFlowSelection] =
    useState<ActivityFlowSelection | null>(null)

  const personDetailQuery = useQuery(personQuery.byId(id))

  // 필터 토글마다 queryKey가 바뀌는데, 이전 데이터를 유지하지 않으면
  // 새 키의 isPending 동안 화면 전체가 로딩 상태로 교체되어 깜빡인다.
  const timelineQuery = useQuery(eventQuery.byPerson(id, categoryFilter))

  // 활동 흐름은 카테고리 필터와 무관한 전체 기록 날짜로 그린다.
  const allTimelineQuery = useQuery(eventQuery.byPerson(id))

  const chipsQuery = useQuery(chipQuery.all())

  const person = personDetailQuery.data
  const categoryChips =
    chipsQuery.data?.filter((c) => c.type === 'CATEGORY') ?? []

  const flowPersons = useMemo(
    () =>
      person
        ? [
            {
              id: person.id,
              name: person.name,
              profileImageUrl: person.profileImageUrl,
              gender: person.gender,
            },
          ]
        : [],
    [person],
  )
  const flowRecords = useMemo(
    () =>
      (allTimelineQuery.data ?? []).map((event) => ({
        id: String(event.id),
        date: event.occurredDate,
        personId: id,
      })),
    [allTimelineQuery.data, id],
  )

  const events = useMemo(() => {
    const list = timelineQuery.data ?? []
    if (!flowSelection) return list
    return list.filter((event) =>
      matchesActivityFlowSelection(event.occurredDate, [id], flowSelection),
    )
  }, [flowSelection, id, timelineQuery.data])

  const toggleCategory = (chipId: number) => {
    setCategoryFilter((prev) =>
      prev.includes(chipId)
        ? prev.filter((c) => c !== chipId)
        : [...prev, chipId],
    )
  }

  const firstMetYear = person?.firstMetDate?.slice(0, 4)
  const hasFilter = categoryFilter.length > 0 || flowSelection !== null

  if (!Number.isFinite(id)) {
    return (
      <TimelineScrollShell scrollRef={scrollRef}>
        <StatusMessage inset="screen">잘못된 경로예요.</StatusMessage>
      </TimelineScrollShell>
    )
  }

  if (personDetailQuery.isPending || timelineQuery.isPending) {
    return (
      <TimelineScrollShell scrollRef={scrollRef}>
        <StatusMessage inset="screen">불러오는 중…</StatusMessage>
      </TimelineScrollShell>
    )
  }

  if (!person) {
    return (
      <TimelineScrollShell scrollRef={scrollRef}>
        <StatusMessage inset="screen">
          사람 정보를 불러오지 못했어요.
        </StatusMessage>
      </TimelineScrollShell>
    )
  }

  return (
    <>
      <TimelineScrollShell scrollRef={scrollRef}>
        <div className="mb-4">
          <PageTitle data-amp-mask>{formatPersonName(person)}</PageTitle>
          <p className="mt-1 text-xs font-medium text-muted-foreground">
            {firstMetYear ? `${firstMetYear}년부터 · ` : ''}
            {person.stats.meetCount}번 만남
          </p>
        </div>
        <ListGroup className="mb-4">
          <ListGroupItem
            withDivider={false}
            className="flex items-center gap-3 py-3"
          >
            <MonogramAvatar
              name={person.name}
              imageUrl={person.profileImageUrl}
              gender={person.gender}
              personId={person.id}
              favorite={person.favorite}
              className="size-10"
            />
            <div className="flex gap-6">
              <div>
                <p className="text-base font-extrabold">
                  {person.stats.recordCount}개
                </p>
                <p className="text-caption font-medium text-muted-foreground">
                  함께한 기록
                </p>
              </div>
              <div>
                <p className="text-base font-extrabold">
                  {person.stats.lastMetRelative ?? '기록 없음'}
                </p>
                <p className="text-caption font-medium text-muted-foreground">
                  마지막 만남
                </p>
              </div>
            </div>
          </ListGroupItem>
        </ListGroup>

        {flowPersons.length > 0 ? (
          <div className="mb-4">
            <ActivityFlowChart
              persons={flowPersons}
              records={flowRecords}
              selectedPoint={flowSelection}
              onSelectPoint={setFlowSelection}
            />
          </div>
        ) : null}

        <TimelineCategoryFilters
          chips={categoryChips}
          selectedIds={categoryFilter}
          onToggle={toggleCategory}
        />

        <TimelineFilterReset
          visible={hasFilter}
          onReset={() => {
            setCategoryFilter([])
            setFlowSelection(null)
          }}
        />

        {timelineQuery.isError ? (
          <StatusMessage tone="error" inset="list">
            타임라인을 불러오지 못했어요.
          </StatusMessage>
        ) : events.length === 0 ? (
          <EmptyState className="py-12">
            <EmptyStateDescription>
              {hasFilter
                ? '이 조건에 맞는 기록이 없어요.'
                : '아직 함께한 기록이 없어요. 첫 순간을 새겨보세요.'}
            </EmptyStateDescription>
            <EmptyStateAction>
              <Button
                variant="outline"
                onClick={() => push('Record', { personId })}
              >
                기록 작성
              </Button>
            </EmptyStateAction>
          </EmptyState>
        ) : (
          <TimelineFeed
            scrollRootRef={scrollRef}
            items={events}
            renderCard={(event) => (
              <TimelineEventCard item={fromEventResponse(event)} />
            )}
          />
        )}
      </TimelineScrollShell>

      <Button
        size="icon-lg"
        className="absolute right-0 bottom-4 z-40 size-12 rounded-full shadow-lg"
        onClick={() => push('Record', { personId })}
      >
        ＋
      </Button>
    </>
  )
}
