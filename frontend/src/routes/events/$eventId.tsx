import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { fetchEvent } from '@/lib/api/events'
import { fetchPersons } from '@/lib/api/persons'
import { EventPhotoGallery } from '@/components/events/event-photo-gallery'
import { safeApi } from '@/lib/api/safe'
import { FALLBACK_PERSONS, fallbackEvent } from '@/lib/fallback-data'
import { formatWhen } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import {
  parseEventDetailReturnTo,
  parseRecordSearchId,
  recordEditFromEventDetail,
  resolveEventDetailBack,
} from '@/lib/record-navigation'

export const Route = createFileRoute('/events/$eventId')({
  validateSearch: (search: Record<string, unknown>) => ({
    returnTo: parseEventDetailReturnTo(search.returnTo),
    returnPersonId: parseRecordSearchId(search.returnPersonId),
  }),
  component: EventDetailPage,
})

function EventDetailPage() {
  const { eventId } = Route.useParams()
  const { returnTo, returnPersonId } = Route.useSearch()
  const id = Number(eventId)
  const detailSearch = { returnTo, returnPersonId }
  const back = resolveEventDetailBack(detailSearch)
  const shellActivePath =
    returnTo === 'home'
      ? '/'
      : returnTo === 'person-timeline' || returnTo === 'person-profile'
        ? '/people'
        : '/timeline'

  const eventQuery = useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () =>
      safeApi(() => fetchEvent(id), fallbackEvent(id) ?? undefined),
    enabled: Number.isFinite(id),
  })

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: () => safeApi(() => fetchPersons(), FALLBACK_PERSONS),
    placeholderData: FALLBACK_PERSONS,
  })

  const personById = new Map(
    (personsQuery.data ?? []).map((person) => [person.id, person]),
  )

  if (!Number.isFinite(id)) {
    return (
      <AppShell activePath={shellActivePath}>
        <p className="py-20 text-center text-sm text-muted-foreground">
          잘못된 경로예요.
        </p>
      </AppShell>
    )
  }

  if (eventQuery.isPending) {
    return (
      <AppShell activePath={shellActivePath}>
        <p className="py-20 text-center text-sm text-muted-foreground">
          불러오는 중…
        </p>
      </AppShell>
    )
  }

  const event = eventQuery.data
  if (!event) {
    return (
      <AppShell activePath={shellActivePath}>
        <header className="grid shrink-0 grid-cols-3 items-center py-1">
          <Link
            {...back}
            className="text-lg font-extrabold text-muted-foreground"
          >
            ‹
          </Link>
          <h1 className="text-center text-base font-extrabold">몽글 상세</h1>
          <span aria-hidden className="text-right" />
        </header>
        <p className="py-20 text-center text-sm text-muted-foreground">
          기록을 찾을 수 없어요.
        </p>
      </AppShell>
    )
  }

  const memo = event.memo?.trim() ?? ''

  return (
    <AppShell activePath={shellActivePath} className="px-0">
      <header className="grid shrink-0 grid-cols-3 items-center px-5 py-1">
        <Link
          {...back}
          className="text-lg font-extrabold text-muted-foreground"
        >
          ‹
        </Link>
        <h1 className="text-center text-base font-extrabold">몽글 상세</h1>
        <Link
          to="/record"
          search={recordEditFromEventDetail(id, detailSearch)}
          className="text-right text-[15px] font-extrabold"
        >
          수정
        </Link>
      </header>

      <div className="min-h-0 flex-1 overflow-y-auto px-5 pb-8 [-webkit-overflow-scrolling:touch]">
        <div className="flex items-start gap-2">
          <h2 className="min-w-0 flex-1 text-[22px] leading-snug font-extrabold tracking-tight">
            {event.title}
          </h2>
          {event.category ? (
            <Badge
              variant="secondary"
              className="h-7 shrink-0 rounded-full px-3 font-extrabold"
            >
              {event.category.label}
            </Badge>
          ) : null}
        </div>

        <p className="mt-2 text-sm font-bold text-muted-foreground">
          {formatWhen(event.occurredDate, event.occurredTime)}
        </p>

        {event.persons.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {event.persons.map((person) => {
              const profile = personById.get(person.id)
              return (
                <Link
                  key={person.id}
                  to="/people/$personId"
                  params={{ personId: String(person.id) }}
                  className="inline-flex items-center gap-1.5 rounded-full bg-muted/70 py-1 pr-2.5 pl-1 transition-colors hover:bg-muted"
                >
                  <MonogramAvatar
                    name={person.name}
                    imageUrl={profile?.profileImageUrl}
                    gender={profile?.gender}
                    personId={person.id}
                    favorite={profile?.favorite}
                    className="size-6"
                  />
                  <span className="text-xs font-extrabold text-foreground">
                    {person.name}
                  </span>
                </Link>
              )
            })}
          </div>
        ) : null}

        {memo ? (
          <p className="mt-4 whitespace-pre-wrap text-[15px] leading-relaxed text-foreground">
            {memo}
          </p>
        ) : null}

        {event.emotions.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {event.emotions.map((emotion) => (
              <Badge key={emotion.id} variant="outline">
                {emotion.label}
              </Badge>
            ))}
          </div>
        ) : null}

        {event.weather ? (
          <p className="mt-3 text-xs font-bold text-muted-foreground">
            날씨 · {event.weather.label}
          </p>
        ) : null}

        <EventPhotoGallery photoUrls={event.photoUrls} />
      </div>
    </AppShell>
  )
}
