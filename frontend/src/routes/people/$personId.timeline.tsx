import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
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
import { fetchChips } from '@/lib/api/chips'
import { fetchPersonTimeline } from '@/lib/api/events'
import { fetchPerson } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import { FALLBACK_CHIPS, fallbackPersonDetail } from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'
import { matchesActivityFlowSelection } from '@/lib/timeline-activity-flow'
import type { ActivityFlowSelection } from '@/lib/timeline-activity-flow'
import { recordSearch } from '@/lib/record-navigation'

export const Route = createFileRoute('/people/$personId/timeline')({
  component: PersonTimelinePage,
})

function PersonTimelinePage() {
  const { personId } = Route.useParams()
  const id = Number(personId)
  const scrollRef = useRef<HTMLDivElement>(null)
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [flowSelection, setFlowSelection] =
    useState<ActivityFlowSelection | null>(null)

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => safeApi(() => fetchPerson(id), fallbackPersonDetail(id)),
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
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
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
        activePath="/people"
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
        activePath="/people"
        scrollRef={scrollRef}
        header={<PersonPageHeader personId={personId} active="timeline" />}
      >
        <p className="py-12 text-center text-sm text-muted-foreground">
          불러오는 중…
        </p>
      </TimelineScrollShell>
    )
  }

  if (!person) {
    return (
      <TimelineScrollShell
        activePath="/people"
        scrollRef={scrollRef}
        header={<PersonPageHeader personId={personId} active="timeline" />}
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
        activePath="/people"
        scrollRef={scrollRef}
        header={<PersonPageHeader personId={personId} active="timeline" />}
      >
        <div className="mb-4">
          <h1 className="text-[22px] font-black tracking-tight">
            {person.name}
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
            <Button asChild className="mt-4" variant="outline">
              <Link to="/record" search={recordSearch({ personId: id })}>
                기록 작성
              </Link>
            </Button>
          </div>
        ) : (
          <TimelineFeed
            scrollRootRef={scrollRef}
            items={events}
            renderCard={(event) => (
              <TimelineEventCard
                item={fromEventResponse(event)}
                returnTo="person-timeline"
                returnPersonId={id}
              />
            )}
          />
        )}
      </TimelineScrollShell>

      <Button
        asChild
        size="icon-lg"
        className="fixed right-5 bottom-6 z-40 size-12 rounded-full shadow-lg"
      >
        <Link to="/record" search={recordSearch({ personId: id })}>
          ＋
        </Link>
      </Button>
    </>
  )
}
