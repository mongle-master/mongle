import { useQuery } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import { useMemo, useRef, useState } from 'react'
import { ActivityFlowChart } from '@/components/timeline/activity-flow-chart'
import {
  TimelineCategoryFilters,
  TimelineFilterReset,
} from '@/components/timeline/timeline-filters'
import {
  fromEventResponse,
  TimelineEventCard,
} from '@/components/timeline/timeline-event-card'
import { TimelineFeed } from '@/components/timeline/timeline-feed'
import { TimelineScrollShell } from '@/components/timeline/timeline-scroll-shell'
import { PersonPageHeader } from '@/components/person/person-page-header'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Button } from '@/components/ui/button'
import { ListGroup, ListGroupItem } from '@/components/ui/list-group'
import { Skeleton } from '@/components/ui/skeleton'
import { fetchChips } from '@/lib/api/chips'
import { fetchPersonTimeline } from '@/lib/api/events'
import { fetchPerson } from '@/lib/api/persons'
import { formatPersonName } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { matchesActivityFlowSelection } from '@/lib/timeline-activity-flow'
import type { ActivityFlowSelection } from '@/lib/timeline-activity-flow'
import type { PersonView } from '@/stackflow/stackflow.config'

export function PersonTimelineView({
  personId,
  onSelectView,
}: {
  personId: string
  onSelectView: (view: PersonView) => void
}) {
  const id = Number(personId)
  const { push } = useFlow()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [flowSelection, setFlowSelection] =
    useState<ActivityFlowSelection | null>(null)

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => fetchPerson(id),
    enabled: Number.isFinite(id),
  })

  const timelineQuery = useQuery({
    queryKey: queryKeys.personTimeline(id, categoryFilter),
    queryFn: () => fetchPersonTimeline(id, categoryFilter),
    enabled: Number.isFinite(id),
  })

  // 활동 흐름은 카테고리 필터와 무관한 전체 기록 날짜로 그린다.
  const allTimelineQuery = useQuery({
    queryKey: queryKeys.personTimeline(id, []),
    queryFn: () => fetchPersonTimeline(id),
    enabled: Number.isFinite(id),
  })

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => fetchChips(),
  })

  const person = personQuery.data
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
      <TimelineScrollShell
        scrollRef={scrollRef}
        header={
          <p className="text-sm text-muted-foreground">잘못된 경로예요.</p>
        }
      >
        <p className="py-20 text-center text-sm text-muted-foreground">
          잘못된 경로예요.
        </p>
      </TimelineScrollShell>
    )
  }

  if (personQuery.isPending || timelineQuery.isPending) {
    return (
      <TimelineScrollShell
        scrollRef={scrollRef}
        header={
          <PersonPageHeader active="timeline" onSelectView={onSelectView} />
        }
      >
        <div role="status" aria-label="불러오는 중">
          <div className="mb-4">
            <Skeleton className="h-7 w-32" />
            <Skeleton className="mt-2 h-3.5 w-40" />
          </div>
          <ListGroup className="mb-4">
            <ListGroupItem
              withDivider={false}
              className="flex items-center gap-3 py-3"
            >
              <Skeleton className="size-10 rounded-full" />
              <div className="flex gap-6">
                {[0, 1].map((stat) => (
                  <div key={stat}>
                    <Skeleton className="h-5 w-14" />
                    <Skeleton className="mt-1.5 h-3 w-16" />
                  </div>
                ))}
              </div>
            </ListGroupItem>
          </ListGroup>
          <ListGroup>
            {[0, 1, 2].map((row) => (
              <ListGroupItem key={row} withDivider={row < 2} className="py-3">
                <Skeleton className="h-4 w-3/5" />
                <Skeleton className="mt-2 h-3 w-24" />
              </ListGroupItem>
            ))}
          </ListGroup>
        </div>
      </TimelineScrollShell>
    )
  }

  if (!person) {
    return (
      <TimelineScrollShell
        scrollRef={scrollRef}
        header={
          <PersonPageHeader active="timeline" onSelectView={onSelectView} />
        }
      >
        <p className="py-20 text-center text-sm text-muted-foreground">
          사람 정보를 불러오지 못했어요.
        </p>
      </TimelineScrollShell>
    )
  }

  return (
    <>
      <TimelineScrollShell
        scrollRef={scrollRef}
        header={
          <PersonPageHeader active="timeline" onSelectView={onSelectView} />
        }
      >
        <div className="mb-4">
          <h1 className="text-[22px] font-black tracking-tight">
            {formatPersonName(person)}
          </h1>
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
                <p className="text-[11px] font-medium text-muted-foreground">
                  함께한 기록
                </p>
              </div>
              <div>
                <p className="text-base font-extrabold">
                  {person.stats.lastMetRelative ?? '기록 없음'}
                </p>
                <p className="text-[11px] font-medium text-muted-foreground">
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
          <p className="py-12 text-center text-sm text-destructive">
            타임라인을 불러오지 못했어요.
          </p>
        ) : events.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {hasFilter
                ? '이 조건에 맞는 기록이 없어요.'
                : '아직 함께한 기록이 없어요. 첫 순간을 새겨보세요.'}
            </p>
            <Button
              className="mt-4"
              variant="outline"
              onClick={() => push('Record', { personId })}
            >
              기록 작성
            </Button>
          </div>
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
        className="absolute right-5 bottom-6 z-40 size-12 rounded-full shadow-lg"
        onClick={() => push('Record', { personId })}
      >
        ＋
      </Button>
    </>
  )
}
