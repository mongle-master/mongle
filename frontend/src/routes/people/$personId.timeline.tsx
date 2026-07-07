import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { ActivityFlowChart } from '@/components/timeline/activity-flow-chart'
import { PersonTabs } from '@/components/timeline/person-tabs'
import { PersonTimelineCard } from '@/components/timeline/person-timeline-card'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { fetchChips } from '@/lib/api/chips'
import { fetchActivityFlow, fetchPersonTimeline } from '@/lib/api/events'
import { fetchPerson } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import {
  FALLBACK_ACTIVITY_FLOW,
  FALLBACK_CHIPS,
  fallbackPersonDetail,
  fallbackPersonTimeline,
} from '@/lib/fallback-data'
import { formatEventDate } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/people/$personId/timeline')({
  component: PersonTimelinePage,
})

function PersonTimelinePage() {
  const { personId } = Route.useParams()
  const id = Number(personId)
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [monthFilter, setMonthFilter] = useState<string | null>(null)

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => safeApi(() => fetchPerson(id), fallbackPersonDetail(id)),
    enabled: Number.isFinite(id),
    initialData: fallbackPersonDetail(id),
  })

  const timelineQuery = useQuery({
    queryKey: queryKeys.personTimeline(id, categoryFilter),
    queryFn: () =>
      safeApi(
        () => fetchPersonTimeline(id, categoryFilter),
        fallbackPersonTimeline(id).filter(
          (e) =>
            categoryFilter.length === 0 ||
            (e.category && categoryFilter.includes(e.category.id)),
        ),
      ),
    enabled: Number.isFinite(id),
    initialData: fallbackPersonTimeline(id),
  })

  const flowQuery = useQuery({
    queryKey: queryKeys.activityFlow(id),
    queryFn: () => safeApi(() => fetchActivityFlow(id), FALLBACK_ACTIVITY_FLOW),
    enabled: Number.isFinite(id),
    initialData: FALLBACK_ACTIVITY_FLOW,
  })

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })

  const person = personQuery.data
  const flow = flowQuery.data
  const categoryChips = chipsQuery.data.filter((c) => c.type === 'CATEGORY')

  const events = useMemo(() => {
    const list = timelineQuery.data
    if (!monthFilter) return list
    return list.filter((e) => e.occurredDate.startsWith(monthFilter))
  }, [timelineQuery.data, monthFilter])

  const toggleCategory = (chipId: number) => {
    setCategoryFilter((prev) =>
      prev.includes(chipId)
        ? prev.filter((c) => c !== chipId)
        : [...prev, chipId],
    )
  }

  const firstMetYear = person.firstMetDate?.slice(0, 4)

  return (
    <AppShell activePath="/" withNav className="relative px-0">
      <header className="mb-1 flex items-center gap-3 px-5">
        <Link to="/" className="text-lg font-extrabold text-muted-foreground">
          ‹
        </Link>
        <div>
          <h1 className="text-lg font-extrabold">{person.name}와의 이야기</h1>
          <p className="text-[11.5px] text-muted-foreground">
            {firstMetYear ? `${firstMetYear}년부터 · ` : ''}
            {person.stats.meetCount}번 만남
          </p>
        </div>
      </header>

      <PersonTabs personId={personId} active="timeline" />

      <Card className="mx-5 mb-3 flex items-center gap-3 p-3">
        <MonogramAvatar
          name={person.name}
          imageUrl={person.profileImageUrl}
          favorite={person.favorite}
          className="size-10"
        />
        <div className="flex gap-6">
          <div>
            <p className="text-base font-extrabold">
              {person.stats.recordCount}개
            </p>
            <p className="text-[11px] text-muted-foreground">함께한 기록</p>
          </div>
          <div>
            <p className="text-base font-extrabold">
              {person.stats.lastMetRelative ?? '기록 없음'}
            </p>
            <p className="text-[11px] text-muted-foreground">마지막 만남</p>
          </div>
        </div>
      </Card>

      <div className="mx-5 mb-4">
        <ActivityFlowChart
          flow={flow}
          selectedMonth={monthFilter}
          onSelectMonth={setMonthFilter}
        />
      </div>

      {categoryChips.length > 0 ? (
        <div className="mb-4 flex flex-wrap gap-2 px-5">
          {categoryChips.map((chip) => {
            const selected = categoryFilter.includes(chip.id)
            return (
              <button
                key={chip.id}
                type="button"
                onClick={() => toggleCategory(chip.id)}
              >
                <Badge
                  variant={selected ? 'default' : 'outline'}
                  className={cn(
                    'cursor-pointer px-3 py-1.5 text-xs font-bold',
                    !selected && 'bg-card',
                  )}
                >
                  {chip.label}
                </Badge>
              </button>
            )
          })}
          {categoryFilter.length > 0 || monthFilter ? (
            <button
              type="button"
              onClick={() => {
                setCategoryFilter([])
                setMonthFilter(null)
              }}
              className="text-xs font-bold text-muted-foreground underline"
            >
              필터 초기화
            </button>
          ) : null}
        </div>
      ) : null}

      <div className="flex flex-col px-5 pb-20">
        {events.length === 0 ? (
          <div className="py-10 text-center">
            <p className="text-sm text-muted-foreground">
              {categoryFilter.length > 0 || monthFilter
                ? '이 조건에 맞는 기록이 없어요.'
                : '아직 함께한 기록이 없어요. 첫 순간을 새겨보세요.'}
            </p>
            <Button asChild className="mt-4" variant="outline">
              <Link to="/record" search={{ personId: id }}>
                기록 작성
              </Link>
            </Button>
          </div>
        ) : (
          events.map((event) => {
            const { year, date } = formatEventDate(event.occurredDate)
            return (
              <div key={event.id} className="flex gap-2">
                <div className="flex w-[4.375rem] shrink-0 flex-col items-center">
                  <p className="text-center text-[10.5px] font-extrabold text-muted-foreground leading-tight">
                    {year}
                    <br />
                    {date}
                  </p>
                  <div className="mt-1.5 flex size-8 items-center justify-center rounded-full border border-foreground bg-card text-xs">
                    ☕
                  </div>
                  <div className="w-px flex-1 border-l-2 border-dotted border-border" />
                </div>
                <PersonTimelineCard event={event} />
              </div>
            )
          })
        )}
      </div>

      <Button
        asChild
        size="icon-lg"
        className="fixed right-5 bottom-6 z-40 size-12 rounded-full shadow-lg"
      >
        <Link to="/record" search={{ personId: id }}>
          ＋
        </Link>
      </Button>
    </AppShell>
  )
}
