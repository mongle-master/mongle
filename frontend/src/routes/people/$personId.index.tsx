import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { ChevronRight, Star } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Separator } from '@/components/ui/separator'
import { fetchPersonTimeline } from '@/lib/api/events'
import { fetchPerson, togglePersonFavorite } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import type { EventResponse } from '@/lib/api/types'
import { mediaUrl } from '@/lib/api/client'
import {
  fallbackPersonDetail,
  fallbackPersonTimeline,
} from '@/lib/fallback-data'
import {
  formatAbsoluteDate,
  formatBirthday,
  formatDaysSinceFirstMet,
} from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/people/$personId/')({
  component: PersonProfilePage,
})

function PersonProfilePage() {
  const { personId } = Route.useParams()
  const id = Number(personId)
  const queryClient = useQueryClient()

  const personQuery = useQuery({
    queryKey: queryKeys.person(id),
    queryFn: () => safeApi(() => fetchPerson(id), fallbackPersonDetail(id)),
    enabled: Number.isFinite(id),
  })

  const recentQuery = useQuery({
    queryKey: queryKeys.personTimeline(id),
    queryFn: () =>
      safeApi(() => fetchPersonTimeline(id), fallbackPersonTimeline(id)),
    enabled: Number.isFinite(id),
  })

  const favoriteMutation = useMutation({
    mutationFn: () => togglePersonFavorite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: queryKeys.person(id) })
      void queryClient.invalidateQueries({ queryKey: ['persons'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })

  const person = personQuery.data
  const recentEvents = (recentQuery.data ?? []).slice(0, 3)

  if (!Number.isFinite(id) || personQuery.isPending) {
    return (
      <AppShell activePath="/people">
        <p className="py-20 text-center text-sm text-muted-foreground">
          {personQuery.isPending ? '불러오는 중…' : '잘못된 경로예요.'}
        </p>
      </AppShell>
    )
  }

  if (!person) {
    return (
      <AppShell activePath="/people">
        <p className="py-20 text-center text-sm text-muted-foreground">
          사람 정보를 불러오지 못했어요.
        </p>
      </AppShell>
    )
  }

  const birthdayLabel = formatBirthday(person.birthday)

  return (
    <AppShell activePath="/people">
      <div className="flex items-start gap-4">
        <MonogramAvatar
          name={person.name}
          imageUrl={person.profileImageUrl}
          favorite={person.favorite}
          className="size-20"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-extrabold">{person.name}</h1>
            <button
              type="button"
              aria-label="즐겨찾기"
              onClick={() => favoriteMutation.mutate()}
              className="shrink-0"
            >
              <Star
                className={cn(
                  'size-6',
                  person.favorite
                    ? 'fill-foreground text-foreground'
                    : 'text-muted-foreground',
                )}
              />
            </button>
          </div>
          {person.relationType ? (
            <Badge className="mt-2" variant="default">
              {person.relationType}
            </Badge>
          ) : null}
          <div className="mt-2 flex flex-wrap gap-1.5">
            {person.relationTags.map((tag) => (
              <Badge key={tag.id} variant="secondary">
                {tag.label}
              </Badge>
            ))}
          </div>
        </div>
      </div>

      <Card className="mt-5 p-4">
        <dl className="flex flex-col gap-3 text-sm">
          {birthdayLabel ? (
            <InfoRow label="생일" value={birthdayLabel} />
          ) : null}
          {person.firstMetDate ? (
            <InfoRow
              label="처음 만난 날"
              value={[
                formatAbsoluteDate(person.firstMetDate),
                formatDaysSinceFirstMet(person.stats.daysSinceFirstMet),
              ]
                .filter(Boolean)
                .join(' · ')}
            />
          ) : null}
          {person.lastMetDate ? (
            <InfoRow
              label="마지막 만남"
              value={`${formatAbsoluteDate(person.lastMetDate)} · ${person.stats.lastMetRelative ?? '—'}`}
            />
          ) : null}
        </dl>
      </Card>

      <Card className="mt-4 p-4">
        <h2 className="font-extrabold">관계 요약</h2>
        <Separator className="my-3" />
        <dl className="grid grid-cols-2 gap-3 text-sm">
          <Stat label="만난 횟수" value={`${person.stats.meetCount}회`} />
          <Stat label="새긴 기록" value={`${person.stats.recordCount}개`} />
          <Stat
            label="알고 지낸 시간"
            value={person.stats.acquaintancePeriod ?? '—'}
          />
          <Stat
            label="마지막 만남"
            value={person.stats.lastMetRelative ?? '기록 없음'}
          />
        </dl>
      </Card>

      {recentEvents.length > 0 ? (
        <Card className="mt-4 p-4">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="font-extrabold">최근 함께한 일</h2>
            <Link
              to="/people/$personId/timeline"
              params={{ personId }}
              className="text-xs font-bold text-muted-foreground underline"
            >
              전체 보기
            </Link>
          </div>
          <ul className="flex flex-col gap-2.5">
            {recentEvents.map((event) => (
              <RecentEventCard key={event.id} event={event} />
            ))}
          </ul>
        </Card>
      ) : null}

      {person.likes.length > 0 ? (
        <Card className="mt-4 p-4">
          <h2 className="font-extrabold">좋아하는 것</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {person.likes.join(' · ')}
          </p>
        </Card>
      ) : null}

      {person.cautions.length > 0 ? (
        <Card className="mt-4 p-4">
          <h2 className="font-extrabold">조심할 것</h2>
          <p className="mt-2 text-sm text-muted-foreground">
            {person.cautions.join(' · ')}
          </p>
        </Card>
      ) : null}

      <div className="mt-6 flex flex-col gap-2">
        <Button asChild>
          <Link to="/record" search={{ personId: id, eventId: undefined }}>
            상황 기록 작성
          </Link>
        </Button>
        <Button asChild variant="outline">
          <Link to="/people/$personId/edit" params={{ personId }}>
            프로필 수정
          </Link>
        </Button>
      </div>
    </AppShell>
  )
}

function RecentEventCard({ event }: { event: EventResponse }) {
  const photoSrc = mediaUrl(event.photoUrls[0])
  const summary = event.why || event.what

  return (
    <li>
      <Link
        to="/record"
        search={{ eventId: event.id, personId: undefined }}
        className="group flex min-w-0 items-center gap-3 rounded-lg border border-border/80 bg-background px-3 py-2.5 shadow-xs transition-colors hover:bg-muted/40"
      >
        <div className="min-w-0 flex-1">
          <div className="flex min-w-0 items-center gap-1.5">
            <p className="truncate text-sm font-extrabold">{event.title}</p>
            {event.category ? (
              <Badge variant="secondary" className="h-6 shrink-0 px-2 text-xs">
                {event.category.label}
              </Badge>
            ) : null}
          </div>
          <p className="mt-0.5 text-xs font-medium text-muted-foreground">
            {formatAbsoluteDate(event.occurredDate)}
          </p>
          {summary ? (
            <p className="mt-1 line-clamp-1 text-xs text-foreground/80">
              {summary}
            </p>
          ) : null}
        </div>
        {photoSrc ? (
          <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-muted">
            <img
              src={photoSrc}
              alt="최근 기록 사진"
              className="size-full object-cover"
              loading="lazy"
            />
            {event.photoUrls.length > 1 ? (
              <span className="absolute right-1 bottom-1 rounded-full bg-foreground/80 px-1 py-0.5 text-[9px] font-extrabold text-background">
                +{event.photoUrls.length - 1}
              </span>
            ) : null}
          </div>
        ) : (
          <ChevronRight className="size-4 shrink-0 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
        )}
      </Link>
    </li>
  )
}

function InfoRow({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-extrabold">{value}</dd>
    </div>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-muted-foreground">{label}</dt>
      <dd className="font-extrabold">{value}</dd>
    </div>
  )
}
