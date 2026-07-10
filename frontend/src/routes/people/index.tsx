import { Link, createFileRoute } from '@tanstack/react-router'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Plus, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  ListGroup,
  ListGroupInset,
  ListGroupItem,
  ListGroupLabel,
} from '@/components/ui/list-group'

import { fetchPersons, togglePersonFavorite } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import type { PersonResponse } from '@/lib/api/types'
import { FALLBACK_PERSONS } from '@/lib/fallback-data'
import { formatLastMetRelative } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/people/')({
  component: PeopleListPage,
})

type PersonSort = 'NAME' | 'RECENT'

function PeopleListPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<PersonSort>('NAME')
  const queryClient = useQueryClient()

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(`${query}:${sort}`),
    queryFn: () => safeApi(() => fetchPersons(query, sort), FALLBACK_PERSONS),
    initialData: FALLBACK_PERSONS,
  })

  const favoriteMutation = useMutation({
    mutationFn: (id: number) => togglePersonFavorite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['persons'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })

  const { favorites, others } = useMemo(() => {
    const list = personsQuery.data
    return {
      favorites: list.filter((p) => p.favorite),
      others: list.filter((p) => !p.favorite),
    }
  }, [personsQuery.data])

  const totalCount = personsQuery.data.length
  const showSections = sort === 'NAME' && !query.trim() && favorites.length > 0

  return (
    <AppShell activePath="/people" layout="fixed">
      <header className="shrink-0 pb-4">
        <MongleLogo className="mb-5 text-foreground" />
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-[22px] font-black leading-tight tracking-tight text-foreground">
              사람
            </h1>
            <p className="mt-2 text-[15px] font-medium text-muted-foreground">
              {totalCount > 0
                ? `함께한 사람 ${totalCount}명`
                : '함께한 사람을 찾고 관리해요'}
            </p>
          </div>
          <Link
            to="/people/new"
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-extrabold text-primary-foreground"
          >
            <Plus className="size-4" />
            추가
          </Link>
        </div>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <section>
          <ListGroup>
            <ListGroupItem>
              <ListGroupInset className="relative px-2 py-1">
                <Search className="pointer-events-none absolute top-1/2 left-4 size-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="이름·관계 유형 검색"
                  className="h-10 border-0 bg-transparent pl-8 text-[15px] shadow-none focus-visible:ring-0"
                />
              </ListGroupInset>
            </ListGroupItem>
            <ListGroupItem withDivider={false}>
              <ListGroupInset className="flex gap-1 p-1">
                <SortButton
                  active={sort === 'NAME'}
                  onClick={() => setSort('NAME')}
                >
                  이름순
                </SortButton>
                <SortButton
                  active={sort === 'RECENT'}
                  onClick={() => setSort('RECENT')}
                >
                  최근 만남순
                </SortButton>
              </ListGroupInset>
            </ListGroupItem>
          </ListGroup>
        </section>

        {totalCount === 0 ? (
          <PeopleEmptyState query={query} onClear={() => setQuery('')} />
        ) : showSections ? (
          <>
            <PersonSection
              title="즐겨찾기"
              persons={favorites}
              onToggleFavorite={(id) => favoriteMutation.mutate(id)}
            />
            {others.length > 0 ? (
              <PersonSection
                title="전체"
                persons={others}
                onToggleFavorite={(id) => favoriteMutation.mutate(id)}
              />
            ) : null}
          </>
        ) : (
          <PersonSection
            title={query.trim() ? '검색 결과' : '목록'}
            persons={personsQuery.data}
            onToggleFavorite={(id) => favoriteMutation.mutate(id)}
          />
        )}
      </div>
    </AppShell>
  )
}

function PersonSection({
  title,
  persons,
  onToggleFavorite,
}: {
  title: string
  persons: PersonResponse[]
  onToggleFavorite: (id: number) => void
}) {
  return (
    <section>
      <ListGroupLabel>
        {title} · {persons.length}명
      </ListGroupLabel>
      <ListGroup>
        {persons.map((person, index) => (
          <PersonListItem
            key={person.id}
            person={person}
            withDivider={index < persons.length - 1}
            onToggleFavorite={onToggleFavorite}
          />
        ))}
      </ListGroup>
    </section>
  )
}

function PersonListItem({
  person,
  withDivider,
  onToggleFavorite,
}: {
  person: PersonResponse
  withDivider: boolean
  onToggleFavorite: (id: number) => void
}) {
  const tagLabels = person.relationTags.map((t) => t.label)
  const subtitle =
    [person.relationType, tagLabels.join(' · ')].filter(Boolean).join(' · ') ||
    '관계 정보 없음'
  const lastMetLabel = formatLastMetRelative(person.lastMetDate)

  return (
    <ListGroupItem withDivider={withDivider} className="relative py-3">
      <Link
        to="/people/$personId"
        params={{ personId: String(person.id) }}
        className="flex items-center gap-3 pr-10 transition-colors active:opacity-70"
      >
        <MonogramAvatar
          name={person.name}
          imageUrl={person.profileImageUrl}
          gender={person.gender}
          personId={person.id}
          className="size-11"
        />
        <div className="min-w-0 flex-1">
          <p className="truncate text-[15px] font-extrabold text-foreground">
            {person.name}
          </p>
          <p className="mt-0.5 truncate text-xs font-medium text-muted-foreground">
            {subtitle}
          </p>
          <p
            className={cn(
              'mt-1 text-[11px] font-bold',
              lastMetLabel === '기록 없음'
                ? 'text-muted-foreground/70'
                : 'text-muted-foreground',
            )}
          >
            {lastMetLabel === '기록 없음'
              ? lastMetLabel
              : `마지막 만남 · ${lastMetLabel}`}
          </p>
        </div>
      </Link>
      <button
        type="button"
        aria-label={person.favorite ? '즐겨찾기 해제' : '즐겨찾기'}
        onClick={() => onToggleFavorite(person.id)}
        className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
      >
        <Star
          className={cn(
            'size-5',
            person.favorite
              ? 'fill-foreground text-foreground'
              : 'text-muted-foreground/40',
          )}
        />
      </button>
    </ListGroupItem>
  )
}

function PeopleEmptyState({
  query,
  onClear,
}: {
  query: string
  onClear: () => void
}) {
  const trimmed = query.trim()

  return (
    <section>
      <ListGroup>
        <ListGroupItem withDivider={false} className="py-12 text-center">
          <div className="mx-auto mb-4 flex size-14 items-center justify-center rounded-full bg-background/80 text-2xl dark:bg-background/40">
            👤
          </div>
          <p className="text-[15px] font-extrabold text-foreground">
            {trimmed ? '검색 결과가 없어요' : '아직 기록한 사람이 없어요'}
          </p>
          <p className="mx-auto mt-2 max-w-[240px] text-sm font-medium text-muted-foreground">
            {trimmed
              ? `'${trimmed}'에 해당하는 사람을 찾지 못했어요.`
              : '첫 사람을 추가하고 관계를 남겨보세요.'}
          </p>
          {trimmed ? (
            <Button
              variant="outline"
              className="mt-5 rounded-full border-border/60 bg-background"
              onClick={onClear}
            >
              검색 지우기
            </Button>
          ) : (
            <Link
              to="/people/new"
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              <Plus className="size-4" />
              사람 추가
            </Link>
          )}
        </ListGroupItem>
      </ListGroup>
    </section>
  )
}

function SortButton({
  active,
  onClick,
  children,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex flex-1 items-center justify-center rounded-lg py-2.5 text-[13px] font-extrabold transition-colors',
        active
          ? 'bg-foreground text-background shadow-sm'
          : 'text-muted-foreground hover:text-foreground',
      )}
    >
      {children}
    </button>
  )
}
