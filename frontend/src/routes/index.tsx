import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { Clock3, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { RelationForceMap } from '@/components/home/relation-force-map'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { AppShell } from '@/components/layout/app-shell'
import { Card } from '@/components/ui/card'
import { fetchRelationMap, fetchThrowback } from '@/lib/api/home'
import type { RelationMapResponse } from '@/lib/api/types'
import { FALLBACK_RELATION_MAP, FALLBACK_THROWBACK } from '@/lib/fallback-data'
import {
  getDefaultHomePeriod,
  isPersonInHomePeriod,
  setDefaultHomePeriod,
} from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { queryKeys } from '@/lib/query-keys'
import { safeApi } from '@/lib/api/safe'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [period, setPeriod] = useState<HomePeriod>(() => getDefaultHomePeriod())
  const [dismissedThrowback, setDismissedThrowback] = useState(false)

  useEffect(() => {
    const syncPeriod = () => setPeriod(getDefaultHomePeriod())
    const onVisible = () => {
      if (document.visibilityState === 'visible') syncPeriod()
    }
    window.addEventListener('focus', syncPeriod)
    document.addEventListener('visibilitychange', onVisible)
    return () => {
      window.removeEventListener('focus', syncPeriod)
      document.removeEventListener('visibilitychange', onVisible)
    }
  }, [])

  const handlePeriodChange = (next: HomePeriod) => {
    setPeriod(next)
    setDefaultHomePeriod(next)
  }

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
  const mapData: RelationMapResponse | undefined = mapQuery.data

  const visibleNodes = useMemo(
    () =>
      (mapData?.nodes ?? []).filter((node) =>
        isPersonInHomePeriod(node.firstMetDate, period),
      ),
    [mapData?.nodes, period],
  )

  const visibleNodeIds = useMemo(
    () => new Set(visibleNodes.map((n) => n.id)),
    [visibleNodes],
  )

  const visibleEdges = useMemo(
    () => (mapData?.edges ?? []).filter((e) => visibleNodeIds.has(e.personId)),
    [mapData?.edges, visibleNodeIds],
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
      </header>

      <section className="mb-4">
        <HomePeriodToggle value={period} onChange={handlePeriodChange} />
      </section>

      {mapQuery.isPending ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          관계 지도를 불러오는 중…
        </p>
      ) : !mapData ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          관계 지도를 불러오지 못했어요.
        </p>
      ) : visibleNodes.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          이 기간에 처음 만난 사람이 없어요.
        </p>
      ) : (
        <RelationForceMap
          key={period}
          me={mapData.me}
          nodes={visibleNodes}
          edges={visibleEdges}
        />
      )}

      {throwback && !dismissedThrowback ? (
        <div className="pointer-events-none fixed right-4 bottom-[6.25rem] left-4 z-40">
          <div className="pointer-events-auto mx-auto w-full max-w-md">
            <Card className="relative flex min-h-[82px] flex-row items-center gap-3 rounded-lg border-0 bg-white p-3.5 pr-10 text-foreground shadow-[0_18px_42px_rgba(24,24,27,0.14)]">
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
