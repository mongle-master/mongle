import { useQuery } from '@tanstack/react-query'
import { useEffect, useMemo, useState } from 'react'
import { homeQuery } from '@/apis/queries'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { RelationForceMap } from '@/components/home/relation-force-map'
import { ThrowbackCard } from '@/components/home/throwback-card'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { TabShell } from '@/stackflow/components/tab-shell'
import { PageTitle } from '@/components/ui/page-title'
import { StatusMessage } from '@/components/ui/status-message'
import {
  getDefaultHomePeriod,
  isPersonInHomePeriod,
  subscribeDefaultHomePeriod,
} from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { featureEvents, trackFeature } from '@/lib/analytics'
import { useAppFlow } from '@/stackflow/use-app-flow'

export function HomeTab() {
  const { push } = useAppFlow()
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
          onSelectPerson={(id) =>
            push('Person', { personId: String(id), view: 'timeline' })
          }
        />
      )}

      {throwback && !throwbackDismissed ? (
        <div className="pointer-events-none absolute right-4 bottom-[6.25rem] left-4 z-40">
          <ThrowbackCard
            occurredDate={throwback.occurredDate}
            title={throwback.title}
            personName={throwback.personName}
            exiting={throwbackExiting}
            onOpen={() => {
              void trackFeature(featureEvents.throwbackOpened)
              push('Person', {
                personId: String(throwback.personId),
                view: 'timeline',
              })
            }}
            onDismiss={() => {
              setThrowbackExiting(true)
              void trackFeature(featureEvents.throwbackDismissed)
            }}
            onExitEnd={() => setThrowbackDismissed(true)}
          />
        </div>
      ) : null}
    </TabShell>
  )
}
