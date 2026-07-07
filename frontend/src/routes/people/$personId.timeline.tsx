import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { fetchActivityFlow, fetchPersonTimeline } from '@/lib/api/events'
import { fetchPerson } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import {
  FALLBACK_ACTIVITY_FLOW,
  fallbackPersonDetail,
  fallbackPersonTimeline,
} from '@/lib/fallback-data'
import { formatEventDate, formatWhen } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/people/$personId/timeline')({
  component: PersonTimelinePage,
})

function PersonTimelinePage() {
  const { personId } = Route.useParams()
  const id = Number(personId)

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => safeApi(() => fetchPerson(id), fallbackPersonDetail(id)),
    enabled: Number.isFinite(id),
  })

  const timelineQuery = useQuery({
    queryKey: queryKeys.personTimeline(id),
    queryFn: () =>
      safeApi(() => fetchPersonTimeline(id), fallbackPersonTimeline(id)),
    enabled: Number.isFinite(id),
  })

  const flowQuery = useQuery({
    queryKey: queryKeys.activityFlow(id),
    queryFn: () => safeApi(() => fetchActivityFlow(id), FALLBACK_ACTIVITY_FLOW),
    enabled: Number.isFinite(id),
  })

  const person = personQuery.data ?? fallbackPersonDetail(id)
  const events = timelineQuery.data ?? fallbackPersonTimeline(id)
  const flow = flowQuery.data ?? FALLBACK_ACTIVITY_FLOW

  return (
    <AppShell activePath="/" withNav={false} className="relative px-0">
      <header className="mb-3 flex items-center gap-3 px-5">
        <Link
          to="/people/$personId"
          params={{ personId }}
          className="text-lg font-extrabold text-muted-foreground"
        >
          ‹
        </Link>
        <div>
          <h1 className="text-lg font-extrabold">{person.name}와의 이야기</h1>
          <p className="text-[11.5px] text-muted-foreground">
            {person.stats.acquaintancePeriod ?? '알게 된 지'} ·{' '}
            {person.stats.meetCount}번 만남
          </p>
        </div>
      </header>

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
              {person.stats.lastMetRelative ?? '—'}
            </p>
            <p className="text-[11px] text-muted-foreground">마지막 만남</p>
          </div>
        </div>
      </Card>

      {flow.months.length > 0 ? (
        <Card className="mx-5 mb-4 p-3.5">
          <p className="text-[13px] font-extrabold">활동 흐름</p>
          <p className="mb-3 text-[11px] text-muted-foreground">
            점을 눌러 그날 기록만 보기
          </p>
          {flow.lanes.map((lane) => (
            <div key={lane.lane} className="mb-2 flex items-center gap-2">
              <span className="w-9 text-[11px] font-bold text-muted-foreground">
                {lane.categoryLabel}
              </span>
              <div className="relative flex flex-1 justify-between">
                <div className="absolute top-1/2 right-0 left-0 h-px bg-border" />
                {lane.present.map((on, i) => (
                  <span
                    key={`${lane.lane}-${i}`}
                    className={cn(
                      'relative z-10 size-2.5 rounded-full',
                      on
                        ? 'bg-primary'
                        : 'border border-muted-foreground/30 bg-background',
                    )}
                  />
                ))}
              </div>
            </div>
          ))}
          <div className="mt-1 flex justify-between pl-9 text-[10px] font-bold text-muted-foreground">
            {flow.months.map((m) => (
              <span key={m}>{m.slice(5)}월</span>
            ))}
          </div>
        </Card>
      ) : null}

      <div className="flex flex-col px-5">
        {events.length === 0 ? (
          <p className="py-8 text-center text-sm text-muted-foreground">
            아직 함께한 기록이 없어요.
          </p>
        ) : (
          events.map((event) => {
            const { year, date } = formatEventDate(event.occurredDate)
            const when = formatWhen(event.occurredDate, event.occurredTime)
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
                <Card className="relative mb-3.5 flex-1 shadow-sm">
                  <CardContent className="p-3">
                    <div className="flex items-center gap-2">
                      <h3 className="text-[15.5px] font-extrabold">
                        {event.title}
                      </h3>
                      {event.category ? (
                        <Badge variant="secondary" className="text-[10px]">
                          {event.category.label}
                        </Badge>
                      ) : null}
                    </div>
                    <p className="mt-1.5 text-[11.5px]">
                      <span className="text-muted-foreground">언제 </span>
                      {when}
                    </p>
                    {event.why ? (
                      <p className="mt-1 text-[11.5px]">
                        <span className="text-muted-foreground">
                          왜 만났는지{' '}
                        </span>
                        {event.why}
                      </p>
                    ) : null}
                    {event.what ? (
                      <p className="mt-1 text-[11.5px]">
                        <span className="text-muted-foreground">
                          무엇을 했는지{' '}
                        </span>
                        {event.what}
                      </p>
                    ) : null}
                    {event.emotions.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1">
                        {event.emotions.map((e) => (
                          <Badge
                            key={e.id}
                            variant="outline"
                            className="text-[10px]"
                          >
                            {e.label}
                          </Badge>
                        ))}
                      </div>
                    ) : null}
                  </CardContent>
                </Card>
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
        <Link to="/record">＋</Link>
      </Button>
    </AppShell>
  )
}
