import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { ChevronRight } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { PersonPageHeader } from '@/components/person/person-page-header'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import {
  ListGroup,
  ListGroupItem,
  ListGroupLabel,
} from '@/components/ui/list-group'
import { coloredTagStyle, tagChipClass } from '@/components/ui/tag-chip'
import { fetchPersonTimeline } from '@/lib/api/events'
import { fetchPerson } from '@/lib/api/persons'
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
  formatPersonName,
} from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { recordSearch, eventDetailSearch } from '@/lib/record-navigation'

export const Route = createFileRoute('/people/$personId/')({
  component: PersonProfilePage,
})

function PersonProfilePage() {
  const { personId } = Route.useParams()
  const id = Number(personId)

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

  const person = personQuery.data
  const recentEvents = (recentQuery.data ?? []).slice(0, 3)

  if (!Number.isFinite(id) || personQuery.isPending) {
    return (
      <AppShell activePath="/people" layout="fixed">
        <p className="py-20 text-center text-sm text-muted-foreground">
          {personQuery.isPending ? '불러오는 중…' : '잘못된 경로예요.'}
        </p>
      </AppShell>
    )
  }

  if (!person) {
    return (
      <AppShell activePath="/people" layout="fixed">
        <p className="py-20 text-center text-sm text-muted-foreground">
          사람 정보를 불러오지 못했어요.
        </p>
      </AppShell>
    )
  }

  const birthdayLabel = formatBirthday(person.birthday)
  const displayName = formatPersonName(person)
  const infoRows = [
    birthdayLabel ? { label: '생일', value: birthdayLabel } : null,
    person.firstMetDate
      ? {
          label: '처음 만난 날',
          value: [
            formatAbsoluteDate(person.firstMetDate),
            formatDaysSinceFirstMet(person.stats.daysSinceFirstMet),
          ]
            .filter(Boolean)
            .join(' · '),
        }
      : null,
    person.lastMetDate
      ? {
          label: '마지막 만남',
          value: `${formatAbsoluteDate(person.lastMetDate)} · ${person.stats.lastMetRelative ?? '—'}`,
        }
      : null,
  ].filter((row): row is { label: string; value: string } => row !== null)

  return (
    <AppShell activePath="/people" layout="fixed">
      <div className="flex min-h-0 min-w-0 flex-1 flex-col overflow-hidden">
        <PersonPageHeader personId={personId} active="profile" />

        <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
          <section>
            <ListGroup>
              <ListGroupItem withDivider={false} className="py-4">
                <div className="flex items-start gap-4">
                  <MonogramAvatar
                    name={person.name}
                    imageUrl={person.profileImageUrl}
                    gender={person.gender}
                    personId={person.id}
                    favorite={person.favorite}
                    favoriteBadge="prominent"
                    className="size-20"
                  />
                  <div className="min-w-0 flex-1">
                    <h1 className="truncate text-2xl font-black tracking-tight">
                      {displayName}
                    </h1>
                    {person.relationType ? (
                      <p className="mt-2 text-sm font-extrabold text-foreground">
                        {person.relationType}
                      </p>
                    ) : null}
                    {person.relationTags.length > 0 ? (
                      <div className="mt-2 flex flex-wrap gap-1.5">
                        {person.relationTags.map((tag) => (
                          <span
                            key={tag.id}
                            className={tagChipClass(false, {
                              inactiveClassName:
                                'h-7 border-border/60 bg-background px-3 text-xs text-foreground',
                            })}
                            style={
                              tag.color ? coloredTagStyle(tag.color) : undefined
                            }
                          >
                            {tag.label}
                          </span>
                        ))}
                      </div>
                    ) : null}
                  </div>
                </div>
              </ListGroupItem>
            </ListGroup>
          </section>

          {infoRows.length > 0 ? (
            <section>
              <ListGroupLabel>기본 정보</ListGroupLabel>
              <ListGroup>
                {infoRows.map((row, index) => (
                  <InfoRow
                    key={row.label}
                    label={row.label}
                    value={row.value}
                    withDivider={index < infoRows.length - 1}
                  />
                ))}
              </ListGroup>
            </section>
          ) : null}

          <section>
            <ListGroupLabel>관계 요약</ListGroupLabel>
            <ListGroup>
              <ListGroupItem withDivider={false}>
                <dl className="grid grid-cols-2 gap-x-4 gap-y-4">
                  <Stat
                    label="만난 횟수"
                    value={`${person.stats.meetCount}회`}
                  />
                  <Stat
                    label="새긴 기록"
                    value={`${person.stats.recordCount}개`}
                  />
                  <Stat
                    label="알고 지낸 시간"
                    value={person.stats.acquaintancePeriod ?? '—'}
                  />
                  <Stat
                    label="마지막 만남"
                    value={person.stats.lastMetRelative ?? '기록 없음'}
                  />
                </dl>
              </ListGroupItem>
            </ListGroup>
          </section>

          {recentEvents.length > 0 ? (
            <section>
              <div className="mb-2 flex items-center justify-between px-3">
                <p className="text-[11px] font-extrabold tracking-wide text-muted-foreground uppercase">
                  최근 함께한 일
                </p>
                <Link
                  to="/people/$personId/timeline"
                  params={{ personId }}
                  className="flex size-8 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
                  aria-label="최근 함께한 일 전체 보기"
                >
                  <ChevronRight className="size-5" />
                </Link>
              </div>
              <ListGroup>
                {recentEvents.map((event, index) => (
                  <ListGroupItem
                    key={event.id}
                    withDivider={index < recentEvents.length - 1}
                    className="py-3"
                  >
                    <RecentEventRow event={event} personId={id} />
                  </ListGroupItem>
                ))}
              </ListGroup>
            </section>
          ) : null}

          {person.likes.length > 0 || person.cautions.length > 0 ? (
            <section>
              <ListGroupLabel>취향</ListGroupLabel>
              <ListGroup>
                {person.likes.length > 0 ? (
                  <ListGroupItem withDivider={person.cautions.length > 0}>
                    <PreferenceBlock
                      label="좋아하는 것"
                      value={person.likes.join(' · ')}
                    />
                  </ListGroupItem>
                ) : null}
                {person.cautions.length > 0 ? (
                  <ListGroupItem withDivider={false}>
                    <PreferenceBlock
                      label="조심할 것"
                      value={person.cautions.join(' · ')}
                    />
                  </ListGroupItem>
                ) : null}
              </ListGroup>
            </section>
          ) : null}

          <section>
            <ListGroupLabel>작업</ListGroupLabel>
            <ListGroup>
              <ListGroupItem className="py-0">
                <Link
                  to="/record"
                  search={recordSearch({ personId: id })}
                  className="flex items-center justify-between py-3.5 text-[15px] font-extrabold text-foreground transition-colors active:opacity-70"
                >
                  상황 기록 작성
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              </ListGroupItem>
              <ListGroupItem withDivider={false} className="py-0">
                <Link
                  to="/people/$personId/edit"
                  params={{ personId }}
                  className="flex items-center justify-between py-3.5 text-[15px] font-extrabold text-foreground transition-colors active:opacity-70"
                >
                  프로필 수정
                  <ChevronRight className="size-5 text-muted-foreground" />
                </Link>
              </ListGroupItem>
            </ListGroup>
          </section>
        </div>
      </div>
    </AppShell>
  )
}

function RecentEventRow({
  event,
  personId,
}: {
  event: EventResponse
  personId: number
}) {
  const photoSrc = mediaUrl(event.photoUrls[0])
  const summary = event.memo

  return (
    <Link
      to="/events/$eventId"
      params={{ eventId: String(event.id) }}
      search={eventDetailSearch({
        returnTo: 'person-profile',
        returnPersonId: personId,
      })}
      className="flex min-w-0 items-center gap-3 transition-colors active:opacity-70"
    >
      <div className="min-w-0 flex-1">
        <div className="flex min-w-0 items-center gap-2">
          <p className="truncate text-sm font-extrabold">{event.title}</p>
          {event.category ? (
            <span
              className={tagChipClass(false, {
                inactiveClassName:
                  'h-6 shrink-0 border-border/60 bg-background px-2 text-[11px] text-foreground',
              })}
            >
              {event.category.label}
            </span>
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
        <div className="relative size-12 shrink-0 overflow-hidden rounded-xl bg-muted">
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
        <ChevronRight className="size-5 shrink-0 text-muted-foreground" />
      )}
    </Link>
  )
}

function PreferenceBlock({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-bold text-muted-foreground">{label}</p>
      <p className="mt-1 text-sm font-medium text-foreground">{value}</p>
    </div>
  )
}

function InfoRow({
  label,
  value,
  withDivider,
}: {
  label: string
  value: string
  withDivider: boolean
}) {
  return (
    <ListGroupItem withDivider={withDivider}>
      <div>
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <p className="mt-1 text-sm font-extrabold text-foreground">{value}</p>
      </div>
    </ListGroupItem>
  )
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <dt className="text-xs font-bold text-muted-foreground">{label}</dt>
      <dd className="mt-1 text-[15px] font-extrabold text-foreground">
        {value}
      </dd>
    </div>
  )
}
