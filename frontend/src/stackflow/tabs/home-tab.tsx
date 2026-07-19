import { useQuery } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import { Clock3, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { homeQuery } from '@/apis/queries'
import { cn } from '@/lib/utils'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { RelationForceMap } from '@/components/home/relation-force-map'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { TabShell } from '@/stackflow/components/tab-shell'
import { Card } from '@/components/ui/card'
import { PageTitle } from '@/components/ui/page-title'
import { StatusMessage } from '@/components/ui/status-message'
import {
  getDefaultHomePeriod,
  isPersonInHomePeriod,
  subscribeDefaultHomePeriod,
} from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { featureEvents, trackFeature } from '@/lib/analytics'

export function HomeTab() {
  const { push } = useFlow()
  // 탭 마운트(첫 방문) 시 설정에 저장된 기본 기간으로 초기화. 탭에서 바꾼 값은 세션 동안 유지되고,
  // 설정 탭에서 기본 기간을 바꾸면 그 값으로 덮어쓴다(홈 탭은 hidden 유지라 리마운트되지 않음).
  const [period, setPeriod] = useState<HomePeriod>(() => getDefaultHomePeriod())
  useEffect(() => subscribeDefaultHomePeriod(setPeriod), [])
  const [throwbackDismissed, setThrowbackDismissed] = useState(false)
  const [throwbackExiting, setThrowbackExiting] = useState(false)

  const mapQuery = useQuery(homeQuery.relationMap())

  const throwbackQuery = useQuery(homeQuery.throwback())

  const throwback = throwbackQuery.data
  const mapData = mapQuery.data

  const visibleNodes = useMemo(
    () =>
      (mapData?.nodes ?? []).filter((node) =>
        isPersonInHomePeriod(node.firstMetDate, period),
      ),
    [mapData?.nodes, period],
  )

  const graphNodes =
    visibleNodes.length > 0 ? visibleNodes : (mapData?.nodes ?? [])

  const visibleNodeIds = useMemo(
    () => new Set(graphNodes.map((n) => n.id)),
    [graphNodes],
  )

  const visibleEdges = useMemo(
    () => (mapData?.edges ?? []).filter((e) => visibleNodeIds.has(e.personId)),
    [mapData?.edges, visibleNodeIds],
  )

  const handlePeriodChange = (next: HomePeriod) => {
    if (next === period) return
    setPeriod(next)
    void trackFeature(featureEvents.homePeriodChanged, { period: next })
  }

  return (
    <TabShell>
      <header className="mb-3">
        <MongleLogo className="mb-5 text-foreground" />
        <PageTitle>
          함께한 순간, <br /> 몽글몽글 쌓이는 중
        </PageTitle>
      </header>

      <section className="mb-4">
        <HomePeriodToggle value={period} onChange={handlePeriodChange} />
      </section>

      {mapQuery.isPending ? (
        <StatusMessage inset="list">관계 지도를 불러오는 중…</StatusMessage>
      ) : mapQuery.isError || !mapData ? (
        <StatusMessage tone="error" inset="list">
          관계 지도를 불러오지 못했어요.
        </StatusMessage>
      ) : (
        <RelationForceMap
          key={period}
          me={mapData.me}
          nodes={graphNodes}
          edges={visibleEdges}
        />
      )}

      {throwback && !throwbackDismissed ? (
        <div className="pointer-events-none absolute right-4 bottom-[6.25rem] left-4 z-40">
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
              <button
                type="button"
                onClick={() => {
                  void trackFeature(featureEvents.throwbackOpened)
                  push('Person', {
                    personId: String(throwback.personId),
                    view: 'timeline',
                  })
                }}
                className="min-w-0 flex-1 text-left"
              >
                <p className="text-sm font-extrabold text-foreground">
                  1년 전 오늘
                  <span className="ml-2 text-caption font-bold text-muted-foreground">
                    {throwback.occurredDate}
                  </span>
                </p>
                <p
                  data-amp-mask
                  className="mt-1 line-clamp-2 text-label font-medium text-muted-foreground"
                >
                  {throwback.title ?? `작년 이맘때 ${throwback.personName}`}
                </p>
              </button>
              <button
                type="button"
                onClick={() => {
                  setThrowbackExiting(true)
                  void trackFeature(featureEvents.throwbackDismissed)
                }}
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
    </TabShell>
  )
}
