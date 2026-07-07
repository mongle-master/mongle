import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Clock3, List, Network, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { RelationForceMap } from '@/components/home/relation-force-map'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { fetchRelationMap, fetchThrowback } from '@/lib/api/home'
import type { RelationMapResponse } from '@/lib/api/types'
import { FALLBACK_RELATION_MAP, FALLBACK_THROWBACK } from '@/lib/fallback-data'
import { getDefaultHomePeriod, isNodeInHomePeriod } from '@/lib/home-period'
import { queryKeys } from '@/lib/query-keys'
import { safeApi } from '@/lib/api/safe'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const period = getDefaultHomePeriod()
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph')
  const [dismissedThrowback, setDismissedThrowback] = useState(false)

  const mapQuery = useQuery({
    queryKey: queryKeys.relationMap,
    queryFn: (): Promise<RelationMapResponse> =>
      safeApi(() => fetchRelationMap(), FALLBACK_RELATION_MAP),
  })

  const throwbackQuery = useQuery({
    queryKey: queryKeys.throwback,
    queryFn: () => safeApi(fetchThrowback, FALLBACK_THROWBACK),
  })

  const throwback = throwbackQuery.data
  const mapData: RelationMapResponse = mapQuery.data ?? FALLBACK_RELATION_MAP

  const visibleNodes = useMemo(
    () =>
      mapData.nodes.filter((node) =>
        isNodeInHomePeriod(node.intimacy.daysSinceLastMeet, period),
      ),
    [mapData.nodes, period],
  )

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  )

  const visibleEdges = useMemo(
    () => mapData.edges.filter((e) => visibleNodeIds.has(e.personId)),
    [mapData.edges, visibleNodeIds],
  )

  return (
    <AppShell activePath="/">
      <header className="mb-5">
        <MongleLogo className="mb-8 text-foreground" />
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-foreground">
          오늘 누구를 떠올릴까?
        </h1>
        <p className="mt-3 text-[15px] font-medium text-muted-foreground">
          최근 연락한 지 2주가 넘은 친구들이 있어요.
        </p>
        <div className="mt-5 flex gap-2">
          <button
            type="button"
            onClick={() => setViewMode('graph')}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] shadow-sm ring-1 ring-border',
              viewMode === 'graph'
                ? 'bg-muted font-extrabold text-primary'
                : 'bg-transparent font-bold text-muted-foreground',
            )}
          >
            <Network className="size-4" />
            그래프뷰
          </button>
          <button
            type="button"
            onClick={() => setViewMode('list')}
            className={cn(
              'flex h-9 items-center gap-1.5 rounded-lg px-3 text-[13px] shadow-sm ring-1 ring-border',
              viewMode === 'list'
                ? 'bg-muted font-extrabold text-primary'
                : 'bg-transparent font-bold text-muted-foreground',
            )}
          >
            <List className="size-4" />
            리스트뷰
          </button>
        </div>
      </header>

      {visibleNodes.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          이 기간에 만난 사람이 없어요.
        </p>
      ) : (
        <>
          {viewMode === 'graph' ? (
            <RelationForceMap
              key={period}
              me={mapData.me}
              nodes={visibleNodes}
              edges={visibleEdges}
            />
          ) : (
            <RelationListView nodes={visibleNodes} />
          )}
        </>
      )}

      {throwback && !dismissedThrowback ? (
        <div className="pointer-events-none fixed right-4 bottom-[6.25rem] left-4 z-40">
          <div className="pointer-events-auto mx-auto w-full max-w-md">
            <Card className="relative flex min-h-[82px] flex-row items-center gap-3 rounded-2xl border-0 bg-white p-3.5 pr-10 text-foreground shadow-[0_18px_42px_rgba(24,24,27,0.14)]">
              <div className="flex size-11 shrink-0 items-center justify-center rounded-full bg-primary text-primary-foreground">
                <Clock3 className="size-5" />
              </div>
              <Link
                to="/people/$personId/timeline"
                params={{ personId: String(throwback.personId) }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-extrabold text-foreground">
                  1년 전 오늘
                  <span className="ml-2 text-[11px] font-bold text-muted-foreground">
                    {throwback.occurredDate}
                  </span>
                </p>
                <p className="mt-1 line-clamp-2 text-[13px] font-medium text-muted-foreground">
                  {throwback.title ?? `작년 이맘때 ${throwback.personName}`}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => setDismissedThrowback(true)}
                className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
                aria-label="닫기"
              >
                <X className="size-4" />
              </button>
            </Card>
          </div>
        </div>
      ) : null}
    </AppShell>
  )
}

function RelationListView({ nodes }: { nodes: RelationMapResponse['nodes'] }) {
  return (
    <div className="mt-5 space-y-2">
      {nodes.map((node) => (
        <Link
          key={node.id}
          to="/people/$personId/timeline"
          params={{ personId: String(node.id) }}
          className="flex items-center gap-3 rounded-2xl bg-white p-3 shadow-sm ring-1 ring-border"
        >
          <MonogramAvatar
            name={node.name}
            imageUrl={node.profileImageUrl}
            favorite={node.favorite}
            className="size-11"
          />
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-extrabold text-foreground">
              {node.name}
            </p>
            <p className="truncate text-xs font-medium text-muted-foreground">
              {node.relationTags.map((tag) => tag.label).join(', ') ||
                '관계 태그 없음'}
            </p>
          </div>
          <span className="text-xs font-bold text-muted-foreground">
            {node.intimacy.daysSinceLastMeet === null
              ? '기록 없음'
              : `${node.intimacy.daysSinceLastMeet}일 전`}
          </span>
        </Link>
      ))}
    </div>
  )
}
