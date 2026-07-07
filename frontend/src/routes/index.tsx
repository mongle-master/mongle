import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { LayoutGrid, List, Search, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Separator } from '@/components/ui/separator'
import { fetchRelationMap, fetchThrowback } from '@/lib/api/home'
import { fetchPersons } from '@/lib/api/persons'
import { safeApi } from '@/lib/api/safe'
import {
  FALLBACK_PERSONS,
  FALLBACK_RELATION_MAP,
  FALLBACK_THROWBACK,
} from '@/lib/fallback-data'
import { layoutOnCircle } from '@/lib/format'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'

type HomeSearch = { view?: 'graph' | 'list' }

export const Route = createFileRoute('/')({
  validateSearch: (search: Record<string, unknown>): HomeSearch => ({
    view: search.view === 'list' ? 'list' : 'graph',
  }),
  component: HomePage,
})

function HomePage() {
  const { view = 'graph' } = Route.useSearch()
  const navigate = Route.useNavigate()
  const [listQuery, setListQuery] = useState('')
  const [dismissedThrowback, setDismissedThrowback] = useState(false)

  const mapQuery = useQuery({
    queryKey: queryKeys.relationMap,
    queryFn: () => safeApi(() => fetchRelationMap(), FALLBACK_RELATION_MAP),
  })

  const throwbackQuery = useQuery({
    queryKey: queryKeys.throwback,
    queryFn: () => safeApi(fetchThrowback, FALLBACK_THROWBACK),
  })

  const personsQuery = useQuery({
    queryKey: queryKeys.persons(listQuery),
    queryFn: () => safeApi(() => fetchPersons(listQuery), FALLBACK_PERSONS),
    enabled: view === 'list',
  })

  const setView = (next: 'graph' | 'list') => {
    void navigate({ search: { view: next === 'list' ? 'list' : undefined } })
  }

  const throwback = throwbackQuery.data

  return (
    <AppShell activePath="/">
      <header className="flex items-start justify-between">
        <div>
          <p className="text-xs font-extrabold tracking-wide text-muted-foreground">
            관계도감
          </p>
          <h1 className="text-[22px] font-extrabold tracking-tight">
            나의 관계 지도
          </h1>
        </div>
        <div className="flex overflow-hidden rounded-lg border border-border">
          <Button
            variant={view === 'graph' ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setView('graph')}
            aria-label="그래프 보기"
          >
            <LayoutGrid />
          </Button>
          <Button
            variant={view === 'list' ? 'default' : 'ghost'}
            size="icon-sm"
            onClick={() => setView('list')}
            aria-label="리스트 보기"
          >
            <List />
          </Button>
        </div>
      </header>

      {view === 'graph' ? (
        <RelationMapView data={mapQuery.data ?? FALLBACK_RELATION_MAP} />
      ) : (
        <RelationListView
          persons={personsQuery.data ?? FALLBACK_PERSONS}
          query={listQuery}
          onQueryChange={setListQuery}
        />
      )}

      {throwback && !dismissedThrowback ? (
        <Card className="fixed right-4 bottom-24 left-4 z-40 flex items-center gap-3 border-0 bg-primary p-3.5 text-primary-foreground shadow-xl">
          <div className="flex size-11 shrink-0 flex-col items-center justify-center rounded-xl bg-[#c9f0c2] text-[#256b1e]">
            <span className="text-xs font-extrabold leading-none">1년</span>
            <span className="text-xs font-extrabold leading-none">전</span>
          </div>
          <Link
            to="/people/$personId/timeline"
            params={{ personId: String(throwback.personId) }}
            className="min-w-0 flex-1"
          >
            <p className="text-sm font-extrabold">
              {throwback.title ?? `작년 이맘때 ${throwback.personName}`}
            </p>
            <p className="text-xs opacity-75">
              {throwback.occurredDate} · {throwback.personName}
            </p>
          </Link>
          <button
            type="button"
            onClick={() => setDismissedThrowback(true)}
            className="opacity-50"
            aria-label="닫기"
          >
            <X className="size-4" />
          </button>
        </Card>
      ) : null}
    </AppShell>
  )
}

function RelationMapView({
  data,
}: {
  data: Awaited<ReturnType<typeof fetchRelationMap>>
}) {
  const positions = useMemo(
    () => layoutOnCircle(data.nodes.length),
    [data.nodes.length],
  )

  const edgeByPerson = new Map(data.edges.map((e) => [e.personId, e.distant]))
  const center = { x: 50, y: 52 }

  return (
    <div className="relative mt-2 h-[470px]">
      <svg
        className="pointer-events-none absolute inset-0 size-full"
        aria-hidden
      >
        {data.nodes.map((node, i) => {
          const pos = positions[i]
          const distant = edgeByPerson.get(node.id) ?? false
          return (
            <line
              key={node.id}
              x1={`${center.x}%`}
              y1={`${center.y}%`}
              x2={`${pos.x}%`}
              y2={`${pos.y}%`}
              stroke="currentColor"
              strokeWidth={1.5}
              className={cn(
                'text-border',
                distant && 'text-muted-foreground/40',
              )}
              strokeDasharray={distant ? '4 6' : undefined}
            />
          )
        })}
      </svg>

      <div
        className="absolute flex size-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary font-extrabold text-primary-foreground shadow-lg"
        style={{ left: `${center.x}%`, top: `${center.y}%` }}
      >
        {data.me.label}
      </div>

      <Link
        to="/people/new"
        className="absolute flex size-16 -translate-x-1/2 -translate-y-1/2 flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground text-muted-foreground"
        style={{ left: '78%', top: '52%' }}
      >
        <span className="text-2xl font-normal">＋</span>
        <span className="absolute -bottom-5 text-[11px] font-extrabold whitespace-nowrap">
          사람 추가
        </span>
      </Link>

      {data.nodes.map((node, i) => {
        const pos = positions[i]
        const distant = node.intimacy.status === 'DISTANT'
        return (
          <Link
            key={node.id}
            to="/people/$personId/timeline"
            params={{ personId: String(node.id) }}
            className={cn(
              'absolute flex -translate-x-1/2 -translate-y-1/2 flex-col items-center',
              distant && 'opacity-60',
            )}
            style={{ left: `${pos.x}%`, top: `${pos.y}%` }}
          >
            <MonogramAvatar
              name={node.name}
              imageUrl={node.profileImageUrl}
              favorite={node.favorite}
              className={cn(
                'size-14',
                node.favorite &&
                  'ring-2 ring-foreground ring-offset-2 ring-offset-background',
              )}
            />
            <span className="mt-1 text-[11px] font-bold text-muted-foreground">
              {node.name}
            </span>
          </Link>
        )
      })}
    </div>
  )
}

function RelationListView({
  persons,
  query,
  onQueryChange,
}: {
  persons: Awaited<ReturnType<typeof fetchPersons>>
  query: string
  onQueryChange: (q: string) => void
}) {
  const filtered = query.trim()
    ? persons.filter((p) => p.name.includes(query.trim()))
    : persons

  return (
    <div className="mt-4 flex flex-col gap-4">
      <div className="relative">
        <Search className="absolute top-1/2 left-3 size-4 -translate-y-1/2 text-muted-foreground" />
        <Input
          className="pl-9"
          placeholder="이름으로 검색"
          value={query}
          onChange={(e) => onQueryChange(e.target.value)}
        />
      </div>

      {!filtered.length ? (
        <p className="py-8 text-center text-sm text-muted-foreground">
          {query.trim()
            ? '이 조건에 맞는 사람이 없어요.'
            : '아직 기록한 사람이 없어요.'}
        </p>
      ) : (
        <div className="flex flex-col gap-2">
          {filtered.map((person) => (
            <Link
              key={person.id}
              to="/people/$personId/timeline"
              params={{ personId: String(person.id) }}
            >
              <Card className="p-0 ring-0">
                <div className="flex items-center gap-3 p-3.5">
                  <MonogramAvatar
                    name={person.name}
                    imageUrl={person.profileImageUrl}
                    favorite={person.favorite}
                    className="size-12"
                  />
                  <Separator orientation="vertical" className="h-10" />
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <p className="font-extrabold">{person.name}</p>
                      {person.relationType ? (
                        <span className="text-xs text-muted-foreground">
                          · {person.relationType}
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs text-muted-foreground">
                      {person.relationTags.map((t) => t.label).join(' · ') ||
                        '태그 없음'}
                    </p>
                  </div>
                </div>
              </Card>
            </Link>
          ))}
        </div>
      )}
    </div>
  )
}
