import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import { Plus, Search, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { TabShell } from '@/stackflow/components/tab-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { coloredTagStyle, tagChipClass } from '@/components/ui/tag-chip'
import {
  ListGroup,
  ListGroupInset,
  ListGroupItem,
  ListGroupLabel,
} from '@/components/ui/list-group'

import { fetchPersons, togglePersonFavorite } from '@/lib/api/persons'
import type { PersonResponse } from '@/lib/api/types'
import { formatLastMetRelative, formatPersonName } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

type PersonSort = 'NAME' | 'RECENT'

export function PeopleTab() {
  const { push } = useFlow()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<PersonSort>('NAME')
  const queryClient = useQueryClient()

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(`${query}:${sort}`),
    queryFn: () => fetchPersons(query, sort),
  })

  const favoriteMutation = useMutation({
    mutationFn: (id: number) => togglePersonFavorite(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['persons'] })
      void queryClient.invalidateQueries({ queryKey: ['home'] })
    },
  })

  const { favorites, others } = useMemo(() => {
    const list = personsQuery.data ?? []
    return {
      favorites: list.filter((p) => p.favorite),
      others: list.filter((p) => !p.favorite),
    }
  }, [personsQuery.data])

  const persons = personsQuery.data ?? []
  const totalCount = persons.length
  const showSections = sort === 'NAME' && !query.trim() && favorites.length > 0

  return (
    <TabShell layout="fixed">
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
          <button
            type="button"
            onClick={() => push('PersonNew', {})}
            className="inline-flex shrink-0 items-center gap-1.5 rounded-full bg-primary px-4 py-2 text-[13px] font-extrabold text-primary-foreground"
          >
            <Plus className="size-4" />
            추가
          </button>
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

        {personsQuery.isPending ? (
          <p className="py-12 text-center text-sm text-muted-foreground">
            사람 목록을 불러오는 중…
          </p>
        ) : personsQuery.isError ? (
          <p className="py-12 text-center text-sm text-destructive">
            사람 목록을 불러오지 못했어요.
          </p>
        ) : totalCount === 0 ? (
          <PeopleEmptyState
            query={query}
            onClear={() => setQuery('')}
            onAddPerson={() => push('PersonNew', {})}
          />
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
            persons={persons}
            onToggleFavorite={(id) => favoriteMutation.mutate(id)}
          />
        )}
      </div>
    </TabShell>
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
  const lastMetLabel = formatLastMetRelative(person.lastMetDate)
  const displayName = formatPersonName(person)

  const { push } = useFlow()

  return (
    <ListGroupItem withDivider={withDivider} className="relative py-3">
      <button
        type="button"
        onClick={() => push('Person', { personId: String(person.id) })}
        className="flex w-full items-center gap-3 pr-10 text-left transition-colors active:opacity-70"
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
            {displayName}
          </p>
          <div className="mt-1 flex min-w-0 items-center gap-1.5">
            {person.relationType ? (
              <span className="shrink-0 text-xs font-medium text-muted-foreground">
                {person.relationType}
              </span>
            ) : null}
            {person.relationTags.length > 0 ? (
              <span className="flex min-w-0 gap-1 overflow-hidden">
                {person.relationTags.slice(0, 2).map((tag) => (
                  <span
                    key={tag.id}
                    className={tagChipClass(false, {
                      inactiveClassName:
                        'h-5 max-w-20 border-transparent px-2 text-[10px]',
                    })}
                    style={tag.color ? coloredTagStyle(tag.color) : undefined}
                  >
                    <span className="truncate">{tag.label}</span>
                  </span>
                ))}
              </span>
            ) : !person.relationType ? (
              <span className="text-xs font-medium text-muted-foreground">
                관계 정보 없음
              </span>
            ) : null}
          </div>
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
      </button>
      <button
        type="button"
        aria-label={person.favorite ? '즐겨찾기 해제' : '즐겨찾기'}
        onClick={() => onToggleFavorite(person.id)}
        className="absolute top-1/2 right-3 flex size-9 -translate-y-1/2 items-center justify-center rounded-full text-muted-foreground transition-colors hover:bg-background/80 hover:text-foreground"
      >
        <Star
          className={cn(
            'size-6',
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
  onAddPerson,
}: {
  query: string
  onClear: () => void
  onAddPerson: () => void
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
            <button
              type="button"
              onClick={() => onAddPerson()}
              className="mt-5 inline-flex items-center gap-1.5 rounded-full bg-primary px-5 py-2.5 text-sm font-extrabold text-primary-foreground"
            >
              <Plus className="size-4" />
              사람 추가
            </button>
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
