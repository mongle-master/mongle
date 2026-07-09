import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Clock3, X } from 'lucide-react'
import { useMemo, useState } from 'react'
import { cn } from '@/lib/utils'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { RelationForceMap } from '@/components/home/relation-force-map'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { fetchRelationMap, fetchThrowback } from '@/lib/api/home'
import type { RelationMapResponse } from '@/lib/api/types'
import { FALLBACK_RELATION_MAP, FALLBACK_THROWBACK } from '@/lib/fallback-data'
import { getDefaultHomePeriod, isPersonInHomePeriod } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { queryKeys } from '@/lib/query-keys'
import { safeApi } from '@/lib/api/safe'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  // 홈 진입(마운트)마다 설정에 저장된 기본 기간으로 초기화. 탭에서 바꾼 값은 세션 동안만 유지된다.
  const [period, setPeriod] = useState<HomePeriod>(() => getDefaultHomePeriod())
  const [throwbackDismissed, setThrowbackDismissed] = useState(false)
  const [throwbackExiting, setThrowbackExiting] = useState(false)

  const mapQuery = useQuery({
    queryKey: queryKeys.relationMap([]),
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
        isPersonInHomePeriod(node.firstMetDate, period),
      ),
    [mapData.nodes, period],
  )

  const graphNodes = visibleNodes.length > 0 ? visibleNodes : mapData.nodes

  const visibleNodeIds = useMemo(
    () => new Set(graphNodes.map((n) => n.id)),
    [graphNodes],
  )

  const visibleEdges = useMemo(
    () => mapData.edges.filter((e) => visibleNodeIds.has(e.personId)),
    [mapData.edges, visibleNodeIds],
  )

  return (
    <AppShell activePath="/">
      <header className="mb-3">
        <MongleLogo className="mb-5 text-foreground" />
        <h1 className="text-[28px] font-black leading-tight tracking-tight text-foreground">
          함께한 순간, <br /> 몽글몽글 쌓이는 중
        </h1>
      </header>

      <section className="mb-4">
        <HomePeriodToggle value={period} onChange={setPeriod} />
      </section>

      <RelationForceMap
        key={period}
        me={mapData.me}
        nodes={graphNodes}
        edges={visibleEdges}
      />

      {throwback && !throwbackDismissed ? (
        <div className="pointer-events-none fixed right-4 bottom-[6.25rem] left-4 z-40">
          <div
            className={cn(
              'pointer-events-auto mx-auto w-full max-w-md',
              throwbackExiting
                ? 'animate-out fade-out slide-out-to-bottom-6 duration-300 ease-out fill-mode-forwards'
                : 'animate-in fade-in slide-in-from-bottom-6 duration-300 ease-out',
            )}
            onAnimationEnd={() => {
              if (throwbackExiting) setThrowbackDismissed(true)
            }}
          >
            <Card className="relative flex min-h-[82px] flex-row items-center gap-3 rounded-lg border border-border bg-card p-3.5 pr-10 text-card-foreground shadow-[0_18px_42px_rgba(24,24,27,0.14)] dark:shadow-[0_18px_42px_rgba(0,0,0,0.38)]">
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
                onClick={() => setThrowbackExiting(true)}
                disabled={throwbackExiting}
                className="absolute top-2.5 right-2.5 flex size-7 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground disabled:pointer-events-none"
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
