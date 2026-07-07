import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { MyTimelineCard } from '@/components/timeline/my-timeline-card'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { fetchChips } from '@/lib/api/chips'
import { fetchMyTimeline } from '@/lib/api/timeline'
import { fetchPersons } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import {
  FALLBACK_CHIPS,
  FALLBACK_PERSONS,
  fallbackMyTimeline,
} from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/timeline')({
  component: MyTimelinePage,
})

function MyTimelinePage() {
  const [categoryFilter, setCategoryFilter] = useState<number[]>([])
  const [personFilter, setPersonFilter] = useState<number[]>([])

  const timelineQuery = useQuery({
    queryKey: queryKeys.myTimeline(categoryFilter, personFilter),
    queryFn: () =>
      safeApi(
        () =>
          fetchMyTimeline({
            categoryChipIds: categoryFilter,
            personIds: personFilter,
          }),
        filterFallbackTimeline(categoryFilter, personFilter),
      ),
    initialData: fallbackMyTimeline(),
  })

  const chipsQuery = useQuery({
    queryKey: queryKeys.chips,
    queryFn: () => safeApi(fetchChips, FALLBACK_CHIPS),
    initialData: FALLBACK_CHIPS,
  })

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(),
    queryFn: () => safeApi(() => fetchPersons(), FALLBACK_PERSONS),
    initialData: FALLBACK_PERSONS,
  })

  const categoryChips = chipsQuery.data.filter((c) => c.type === 'CATEGORY')
  const persons = personsQuery.data
  const groups = timelineQuery.data.groups

  const totalCards = useMemo(
    () => groups.reduce((sum, g) => sum + g.cards.length, 0),
    [groups],
  )

  const toggleCategory = (chipId: number) => {
    setCategoryFilter((prev) =>
      prev.includes(chipId)
        ? prev.filter((id) => id !== chipId)
        : [...prev, chipId],
    )
  }

  const togglePerson = (personId: number) => {
    setPersonFilter((prev) =>
      prev.includes(personId)
        ? prev.filter((id) => id !== personId)
        : [...prev, personId],
    )
  }

  const hasFilter = categoryFilter.length > 0 || personFilter.length > 0

  return (
    <AppShell activePath="/timeline">
      <header className="mb-4">
        <MongleLogo className="text-foreground" />
        <h1 className="mt-2 text-[22px] font-extrabold tracking-tight">
          타임라인
        </h1>
        <p className="mt-1 text-xs text-muted-foreground">
          모든 사람과의 기록을 시간순으로
        </p>
      </header>

      <section className="mb-4">
        <p className="mb-2 text-xs font-extrabold text-muted-foreground">
          카테고리
        </p>
        <div className="flex flex-wrap gap-2">
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
        </div>
      </section>

      <section className="mb-5">
        <p className="mb-2 text-xs font-extrabold text-muted-foreground">
          사람
        </p>
        <div className="flex flex-wrap gap-2">
          {persons.map((person) => {
            const selected = personFilter.includes(person.id)
            return (
              <button
                key={person.id}
                type="button"
                onClick={() => togglePerson(person.id)}
                className={cn(
                  'flex items-center gap-1.5 rounded-full border px-2 py-1 text-xs font-bold',
                  selected
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border bg-card text-foreground',
                )}
              >
                <MonogramAvatar
                  name={person.name}
                  imageUrl={person.profileImageUrl}
                  className="size-6"
                />
                {person.name}
              </button>
            )
          })}
        </div>
        {hasFilter ? (
          <button
            type="button"
            onClick={() => {
              setCategoryFilter([])
              setPersonFilter([])
            }}
            className="mt-2 text-xs font-bold text-muted-foreground underline"
          >
            필터 초기화
          </button>
        ) : null}
      </section>

      {totalCards === 0 ? (
        <div className="py-12 text-center">
          <p className="text-sm text-muted-foreground">
            {hasFilter
              ? '이 조건에 맞는 기록이 없어요.'
              : persons.length === 0
                ? '먼저 함께한 사람을 추가해 주세요.'
                : '아직 함께한 기록이 없어요. 첫 순간을 새겨보세요.'}
          </p>
          <Button asChild className="mt-4" variant="outline">
            <Link
              to={persons.length === 0 ? '/people/new' : '/record'}
              search={{ personId: undefined }}
            >
              {persons.length === 0 ? '＋ 사람 추가' : '기록 작성'}
            </Link>
          </Button>
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {groups.map((group) => (
            <section key={`${group.year}-${group.month}`}>
              <h2 className="mb-3 text-sm font-extrabold text-muted-foreground">
                {group.label}
              </h2>
              <div className="flex flex-col gap-3">
                {group.cards.map((card) => (
                  <MyTimelineCard key={card.id} card={card} />
                ))}
              </div>
            </section>
          ))}
        </div>
      )}
    </AppShell>
  )
}

function filterFallbackTimeline(
  categoryChipIds: number[],
  personIds: number[],
) {
  const all = fallbackMyTimeline()
  if (categoryChipIds.length === 0 && personIds.length === 0) return all

  return {
    groups: all.groups
      .map((group) => ({
        ...group,
        cards: group.cards.filter((card) => {
          const categoryOk =
            categoryChipIds.length === 0 ||
            (card.category && categoryChipIds.includes(card.category.id))
          const personOk =
            personIds.length === 0 ||
            card.persons.some((p) => personIds.includes(p.id))
          return categoryOk && personOk
        }),
      }))
      .filter((group) => group.cards.length > 0),
  }
}
