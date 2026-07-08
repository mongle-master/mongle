import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Plus, Star } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { tagChipClass } from '@/components/ui/tag-chip'
import { fetchPersons } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import { FALLBACK_PERSONS } from '@/lib/fallback-data'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/people/')({
  component: PeopleListPage,
})

type PersonSort = 'NAME' | 'RECENT'

function PeopleListPage() {
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState<PersonSort>('NAME')

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(`${query}:${sort}`),
    queryFn: () => safeApi(() => fetchPersons(query, sort), FALLBACK_PERSONS),
    initialData: FALLBACK_PERSONS,
  })

  const persons = useMemo(() => {
    const list = personsQuery.data
    const favorites = list.filter((p) => p.favorite)
    const others = list.filter((p) => !p.favorite)
    return [...favorites, ...others]
  }, [personsQuery.data])

  return (
    <AppShell activePath="/people">
      <header className="mb-4 flex items-start justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-extrabold tracking-tight">사람</h1>
          <p className="mt-1 text-xs text-muted-foreground">
            함께한 사람을 찾고 관리해요
          </p>
        </div>
        <Link
          to="/people/new"
          className="inline-flex shrink-0 items-center gap-1 rounded-full border border-foreground bg-card px-3 py-1.5 text-xs font-extrabold"
        >
          <Plus className="size-3.5" />
          사람 추가
        </Link>
      </header>

      <Input
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="이름·관계 유형 검색"
        className="mb-3"
      />

      <div className="mb-4 flex gap-2">
        <SortButton active={sort === 'NAME'} onClick={() => setSort('NAME')}>
          이름순
        </SortButton>
        <SortButton
          active={sort === 'RECENT'}
          onClick={() => setSort('RECENT')}
        >
          최근 만남순
        </SortButton>
      </div>

      <div className="flex flex-col gap-2">
        {persons.map((person) => (
          <Link
            key={person.id}
            to="/people/$personId"
            params={{ personId: String(person.id) }}
            className="flex items-center gap-3 rounded-lg border border-border bg-card p-3"
          >
            <MonogramAvatar
              name={person.name}
              imageUrl={person.profileImageUrl}
              className="size-11 shrink-0"
            />
            <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
              <p className="truncate font-extrabold leading-tight">
                {person.name}
              </p>
              <p className="text-xs leading-snug text-muted-foreground">
                {[
                  person.relationType,
                  person.relationTags.map((t) => t.label).join(' · '),
                ]
                  .filter(Boolean)
                  .join(' · ') || '관계 정보 없음'}
              </p>
            </div>
            <Star
              className={cn(
                'size-5 shrink-0',
                person.favorite
                  ? 'fill-foreground text-foreground'
                  : 'text-muted-foreground',
              )}
              aria-hidden
            />
          </Link>
        ))}
      </div>

      {persons.length === 0 ? (
        <div className="py-10 text-center">
          <p className="text-sm text-muted-foreground">
            {query.trim()
              ? `'${query.trim()}'에 해당하는 사람이 없어요.`
              : '아직 기록한 사람이 없어요. 첫 사람을 추가해 관계를 남겨보세요.'}
          </p>
          {query.trim() ? (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setQuery('')}
            >
              검색 지우기
            </Button>
          ) : (
            <Link
              to="/people/new"
              className="mt-4 inline-flex items-center gap-1 rounded-full border border-foreground bg-card px-4 py-2 text-sm font-extrabold"
            >
              <Plus className="size-4" />
              사람 추가
            </Link>
          )}
        </div>
      ) : null}
    </AppShell>
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
    <button type="button" onClick={onClick} className={tagChipClass(active)}>
      {children}
    </button>
  )
}
