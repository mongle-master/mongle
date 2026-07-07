import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { motion, AnimatePresence } from 'motion/react'
import { useMemo, useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Card } from '@/components/ui/card'
import { fetchRelationMap, fetchThrowback } from '@/lib/api/home'
import type { RelationMapResponse } from '@/lib/api/types'
import { FALLBACK_RELATION_MAP, FALLBACK_THROWBACK } from '@/lib/fallback-data'
import { layoutOrganicRelationMap, burstDelay } from '@/lib/relation-map-layout'
import { formatAbsoluteDate } from '@/lib/format'
import { getDefaultHomePeriod, isNodeInHomePeriod } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { queryKeys } from '@/lib/query-keys'
import { cn } from '@/lib/utils'
import { safeApi } from '@/lib/api/safe'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const [period, setPeriod] = useState<HomePeriod>(() => getDefaultHomePeriod())
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

  const throwbackPerson = useMemo(
    () =>
      throwback
        ? mapData.nodes.find((n) => n.id === throwback.personId)
        : undefined,
    [mapData.nodes, throwback],
  )

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
      <header className="mb-4">
        <MongleLogo className="text-foreground" />
        <h1 className="mt-2 text-[22px] font-extrabold tracking-tight">
          나의 관계 지도
        </h1>
        <div className="mt-3">
          <HomePeriodToggle value={period} onChange={setPeriod} />
        </div>
      </header>

      {visibleNodes.length === 0 ? (
        <p className="py-16 text-center text-sm text-muted-foreground">
          이 기간에 만난 사람이 없어요.
        </p>
      ) : (
        <RelationMapView
          key={period}
          me={mapData.me}
          nodes={visibleNodes}
          edges={visibleEdges}
        />
      )}

      <AnimatePresence>
        {throwback && !dismissedThrowback ? (
          <motion.div
            key="throwback-alert"
            className="pointer-events-none fixed inset-x-0 bottom-24 z-40"
            initial={{ opacity: 0, y: 28 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            transition={{
              type: 'spring',
              stiffness: 400,
              damping: 24,
              mass: 0.85,
            }}
          >
            <div className="pointer-events-auto mx-auto w-full max-w-md px-5">
              <Card className="relative rounded-2xl border border-foreground bg-white p-3.5 pr-10 text-foreground shadow-lg">
                <button
                  type="button"
                  onClick={() => setDismissedThrowback(true)}
                  className="absolute top-3.5 right-3.5 text-muted-foreground"
                  aria-label="닫기"
                >
                  <X className="size-4" />
                </button>
                <Link
                  to="/people/$personId/timeline"
                  params={{ personId: String(throwback.personId) }}
                  className="flex items-stretch gap-3"
                >
                  <MonogramAvatar
                    name={throwback.personName}
                    imageUrl={throwbackPerson?.profileImageUrl}
                    className="size-12 shrink-0"
                  />
                  <div
                    className="w-px shrink-0 self-stretch bg-border"
                    aria-hidden
                  />
                  <div className="flex min-w-0 flex-1 flex-col justify-center gap-0.5">
                    <p className="text-base font-extrabold leading-snug">
                      1년 전 오늘, {throwback.personName}님과
                    </p>
                    <p className="truncate text-sm leading-snug text-foreground">
                      {throwback.title ??
                        `${throwback.personName}과 함께한 추억`}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {formatAbsoluteDate(throwback.occurredDate)}
                    </p>
                  </div>
                </Link>
              </Card>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </AppShell>
  )
}
function RelationMapView({
  me,
  nodes,
  edges,
}: {
  me: { label: string }
  nodes: (typeof FALLBACK_RELATION_MAP)['nodes']
  edges: (typeof FALLBACK_RELATION_MAP)['edges']
}) {
  const layout = useMemo(
    () => layoutOrganicRelationMap(nodes.map((n) => ({ id: n.id }))),
    [nodes],
  )
  const positions = layout.persons
  const addPosition = layout.add

  const edgeByPerson = new Map(edges.map((e) => [e.personId, e.distant]))
  const center = { x: 50, y: 52 }

  const spring = {
    type: 'spring' as const,
    stiffness: 165,
    damping: 13,
    mass: 0.72,
  }

  return (
    <div className="relative mt-2 h-[470px]">
      <svg
        className="pointer-events-none absolute inset-0 size-full overflow-visible"
        aria-hidden
      >
        {nodes.map((node, i) => {
          const pos = positions[i]
          const distant = edgeByPerson.get(node.id) ?? false
          return (
            <motion.line
              key={node.id}
              x1={`${center.x}%`}
              y1={`${center.y}%`}
              stroke="currentColor"
              strokeWidth={1.5}
              className={cn(
                'text-border',
                distant && 'text-muted-foreground/40',
              )}
              strokeDasharray={distant ? '4 6' : undefined}
              initial={{
                x2: `${center.x}%`,
                y2: `${center.y}%`,
                opacity: 0,
              }}
              animate={{
                x2: `${pos.x}%`,
                y2: `${pos.y}%`,
                opacity: 1,
              }}
              transition={{
                ...spring,
                delay: burstDelay(pos, center, i),
              }}
            />
          )
        })}
      </svg>

      <motion.div
        className="absolute flex size-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary font-extrabold text-primary-foreground shadow-lg"
        style={{ left: `${center.x}%`, top: `${center.y}%` }}
        initial={{ scale: 0.15, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, stiffness: 200, damping: 12 }}
      >
        {me.label}
      </motion.div>

      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        initial={{
          left: `${center.x}%`,
          top: `${center.y}%`,
          scale: 0.2,
          opacity: 0,
        }}
        animate={{
          left: `${addPosition.x}%`,
          top: `${addPosition.y}%`,
          scale: 1,
          opacity: 1,
        }}
        transition={{
          ...spring,
          delay: burstDelay(addPosition, center, nodes.length + 1),
        }}
      >
        <Link
          to="/people/new"
          className="relative flex size-16 flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground text-muted-foreground"
        >
          <span className="text-2xl font-normal">＋</span>
          <span className="absolute -bottom-5 text-[11px] font-extrabold whitespace-nowrap">
            사람 추가
          </span>
        </Link>
      </motion.div>

      {nodes.map((node, i) => {
        const pos = positions[i]
        const distant = node.intimacy.status === 'DISTANT'
        return (
          <motion.div
            key={node.id}
            className="absolute -translate-x-1/2 -translate-y-1/2"
            initial={{
              left: `${center.x}%`,
              top: `${center.y}%`,
              scale: 0.15,
              opacity: 0,
            }}
            animate={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              scale: 1,
              opacity: 1,
            }}
            transition={{
              ...spring,
              delay: burstDelay(pos, center, i),
            }}
          >
            <Link
              to="/people/$personId/timeline"
              params={{ personId: String(node.id) }}
              className="flex flex-col items-center"
            >
              <MonogramAvatar
                name={node.name}
                imageUrl={node.profileImageUrl}
                favorite={node.favorite}
                className={cn(
                  'size-14 opacity-100',
                  node.favorite &&
                    'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                  '[&_[data-slot=avatar-fallback]]:opacity-100',
                )}
              />
              <span
                className={cn(
                  'mt-1 text-[11px] font-bold text-muted-foreground',
                  distant && 'opacity-60',
                )}
              >
                {node.name}
              </span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
