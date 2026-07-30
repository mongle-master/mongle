import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { Clock3, X } from 'lucide-react'
import { useEffect, useMemo, useState } from 'react'
import { homeQuery } from '@/apis/queries'
import { personBondMutation } from '@/apis/mutations'
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
import { useAppFlow } from '@/stackflow/use-app-flow'

// 사이 잇기·끊기 결과를 알리는 한 줄. 토스트 체계가 없어 지도 위에 잠깐 띄우고 스스로 사라진다.
const BOND_NOTICE_MS = 2400

export function HomeTab() {
  const { push } = useAppFlow()
  const queryClient = useQueryClient()
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

  // 기간 토글은 프론트에만 있는 필터라, 한쪽 끝이 걸러진 사이는 여기서 뺀다(백엔드는 관계태그 필터까지만 안다).
  const visibleBonds = useMemo(
    () =>
      (mapData?.bonds ?? []).filter(
        (b) =>
          visibleNodeIds.has(b.personAId) && visibleNodeIds.has(b.personBId),
      ),
    [mapData?.bonds, visibleNodeIds],
  )

  const [bondNotice, setBondNotice] = useState<string | null>(null)
  useEffect(() => {
    if (!bondNotice) return
    const timer = window.setTimeout(() => setBondNotice(null), BOND_NOTICE_MS)
    return () => window.clearTimeout(timer)
  }, [bondNotice])

  const refreshMap = () =>
    queryClient.invalidateQueries({ queryKey: homeQuery.allKey })

  const connectBondMutation = useMutation({
    ...personBondMutation.connect(),
    onSuccess: () => {
      void trackFeature(featureEvents.personBondConnected)
      void refreshMap()
    },
    // 낙관적 반영을 하지 않으므로 되돌릴 것이 없다 — 지도는 서버 응답 그대로 남는다.
    onError: () =>
      setBondNotice('저장에 실패했어요. 잠시 후 다시 시도해 주세요.'),
  })

  const disconnectBondMutation = useMutation({
    ...personBondMutation.disconnect(),
    onSuccess: () => {
      void trackFeature(featureEvents.personBondDisconnected)
      void refreshMap()
    },
    onError: () =>
      setBondNotice('저장에 실패했어요. 잠시 후 다시 시도해 주세요.'),
  })

  const bondPending =
    connectBondMutation.isPending || disconnectBondMutation.isPending

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
          bonds={visibleBonds}
          onSelectPerson={(id) =>
            push('Person', { personId: String(id), view: 'timeline' })
          }
          onConnectBond={(personAId, personBId) =>
            connectBondMutation.mutate({ personAId, personBId })
          }
          onDisconnectBond={(bondId) => disconnectBondMutation.mutate(bondId)}
          onDuplicateBond={() => setBondNotice('이미 이어진 사이예요.')}
          bondPending={bondPending}
        />
      )}

      {bondNotice ? (
        <div
          className={cn(
            'pointer-events-none absolute inset-x-4 z-50 flex justify-center',
            // 회고 카드와 자리가 겹치므로, 카드가 떠 있으면 그 위로 올린다.
            throwback && !throwbackDismissed
              ? 'bottom-[12rem]'
              : 'bottom-[6.25rem]',
          )}
        >
          <p
            role="status"
            className="animate-in fade-in slide-in-from-bottom-2 rounded-full bg-foreground px-3.5 py-2 text-caption font-bold text-background shadow-e4 duration-200"
          >
            {bondNotice}
          </p>
        </div>
      ) : null}

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
            <Card className="relative flex min-h-[82px] flex-row items-center gap-3 rounded-lg border border-border bg-card p-3.5 pr-10 text-card-foreground shadow-e4">
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
