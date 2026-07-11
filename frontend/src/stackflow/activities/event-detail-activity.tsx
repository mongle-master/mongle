import { useQuery } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Skeleton } from '@/components/ui/skeleton'
import { Badge } from '@/components/ui/badge'
import { fetchEvent } from '@/lib/api/events'
import { fetchPersons } from '@/lib/api/persons'
import { EventPhotoGallery } from '@/components/events/event-photo-gallery'
import { formatWhen } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'

// 어디서 push되든 뒤로가기 = pop 하나로 끝난다.
// (구 라우트의 returnTo/returnPersonId 복귀 경로 시뮬레이션을 대체)
export const EventDetailActivity: ActivityComponentType<'EventDetail'> = ({
  params,
}) => {
  const { eventId } = params
  const id = Number(eventId)
  const { push, pop } = useFlow()

  const eventQuery = useQuery({
    queryKey: queryKeys.event(id),
    queryFn: () => fetchEvent(id),
    enabled: Number.isFinite(id),
  })

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: () => fetchPersons(),
  })

  const personById = new Map(
    (personsQuery.data ?? []).map((person) => [person.id, person]),
  )

  if (!Number.isFinite(id)) {
    return (
      <ActivityShell>
        <p className="py-20 text-center text-sm text-muted-foreground">
          잘못된 경로예요.
        </p>
      </ActivityShell>
    )
  }

  if (eventQuery.isPending) {
    return (
      <ActivityShell>
        <header className="grid shrink-0 grid-cols-3 items-center py-1">
          <button
            type="button"
            onClick={() => pop()}
            className="text-left text-lg font-extrabold text-muted-foreground"
            aria-label="뒤로 가기"
          >
            ‹
          </button>
          <h1 className="text-center text-base font-extrabold">몽글 상세</h1>
          <span aria-hidden className="text-right" />
        </header>
        <div role="status" aria-label="불러오는 중" className="mt-6">
          <div className="flex items-start justify-between gap-2">
            <Skeleton className="h-7 w-3/5" />
            <Skeleton className="h-7 w-16 rounded-full" />
          </div>
          <Skeleton className="mt-3 h-4 w-32" />
          <div className="mt-4 flex gap-2">
            <Skeleton className="h-8 w-24 rounded-full" />
            <Skeleton className="h-8 w-20 rounded-full" />
          </div>
          <div className="mt-5 space-y-2">
            <Skeleton className="h-4 w-full" />
            <Skeleton className="h-4 w-11/12" />
            <Skeleton className="h-4 w-2/3" />
          </div>
        </div>
      </ActivityShell>
    )
  }

  const event = eventQuery.data
  if (!event) {
    return (
      <ActivityShell>
        <header className="grid shrink-0 grid-cols-3 items-center py-1">
          <button
            type="button"
            onClick={() => pop()}
            className="text-left text-lg font-extrabold text-muted-foreground"
            aria-label="뒤로 가기"
          >
            ‹
          </button>
          <h1 className="text-center text-base font-extrabold">몽글 상세</h1>
          <span aria-hidden className="text-right" />
        </header>
        <p className="py-20 text-center text-sm text-muted-foreground">
          기록을 찾을 수 없어요.
        </p>
      </ActivityShell>
    )
  }

  const memo = event.memo?.trim() ?? ''

  return (
    <ActivityShell className="px-0">
      <header className="grid shrink-0 grid-cols-3 items-center px-5 py-1">
        <button
          type="button"
          onClick={() => pop()}
          className="text-left text-lg font-extrabold text-muted-foreground"
          aria-label="뒤로 가기"
        >
          ‹
        </button>
        <h1 className="text-center text-base font-extrabold">몽글 상세</h1>
        <button
          type="button"
          onClick={() => push('Record', { eventId: String(id) })}
          className="text-right text-[15px] font-extrabold"
        >
          수정
        </button>
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
                <button
                  key={person.id}
                  type="button"
                  onClick={() =>
                    push('Person', { personId: String(person.id) })
                  }
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
                </button>
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
    </ActivityShell>
  )
}
