import { Link, createFileRoute } from '@tanstack/react-router'
import { useQuery } from '@tanstack/react-query'
import { X } from 'lucide-react'
import { motion } from 'motion/react'
import { useMemo, useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { AppShell } from '@/components/layout/app-shell'
import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import { Card } from '@/components/ui/card'
import { fetchRelationMap, fetchThrowback } from '@/lib/api/home'
import type { RelationMapResponse } from '@/lib/api/types'
import { FALLBACK_RELATION_MAP, FALLBACK_THROWBACK } from '@/lib/fallback-data'
import { layoutOnCircle } from '@/lib/format'
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

      {throwback && !dismissedThrowback ? (
        <div className="pointer-events-none fixed inset-x-0 bottom-24 z-40">
          <div className="pointer-events-auto mx-auto w-full max-w-md px-5">
            <Card className="flex items-center gap-3 rounded-2xl border border-foreground bg-white p-3.5 text-foreground shadow-lg">
              <span className="shrink-0 text-xs font-semibold text-muted-foreground">
                1년 전
              </span>
              <Link
                to="/people/$personId/timeline"
                params={{ personId: String(throwback.personId) }}
                className="min-w-0 flex-1"
              >
                <p className="text-sm font-extrabold">
                  {throwback.title ?? `작년 이맘때 ${throwback.personName}`}
                </p>
                <p className="text-xs text-muted-foreground">
                  {throwback.occurredDate} · {throwback.personName}
                </p>
              </Link>
              <button
                type="button"
                onClick={() => setDismissedThrowback(true)}
                className="text-muted-foreground"
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
function RelationMapView({
  me,
  nodes,
  edges,
}: {
  me: { label: string }
  nodes: (typeof FALLBACK_RELATION_MAP)['nodes']
  edges: (typeof FALLBACK_RELATION_MAP)['edges']
}) {
  const positions = useMemo(() => layoutOnCircle(nodes.length), [nodes.length])

  const edgeByPerson = new Map(edges.map((e) => [e.personId, e.distant]))
  const center = { x: 50, y: 52 }

  const spring = {
    type: 'spring' as const,
    stiffness: 110,
    damping: 18,
    mass: 0.85,
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
                delay: 0.08 + i * 0.045,
              }}
            />
          )
        })}
      </svg>

      <motion.div
        className="absolute flex size-[4.5rem] -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-primary font-extrabold text-primary-foreground shadow-lg"
        style={{ left: `${center.x}%`, top: `${center.y}%` }}
        initial={{ scale: 0.4, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, stiffness: 140, damping: 16 }}
      >
        {me.label}
      </motion.div>

      <motion.div
        className="absolute -translate-x-1/2 -translate-y-1/2"
        style={{ left: '78%', top: '52%' }}
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ ...spring, delay: 0.2 + nodes.length * 0.045 }}
      >
        <Link
          to="/people/new"
          className="flex size-16 flex-col items-center justify-center rounded-full border-2 border-dashed border-muted-foreground text-muted-foreground"
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
            className={cn(
              'absolute -translate-x-1/2 -translate-y-1/2',
              distant && 'opacity-60',
            )}
            initial={{
              left: `${center.x}%`,
              top: `${center.y}%`,
              scale: 0.35,
              opacity: 0,
            }}
            animate={{
              left: `${pos.x}%`,
              top: `${pos.y}%`,
              scale: 1,
              opacity: distant ? 0.6 : 1,
            }}
            transition={{
              ...spring,
              delay: 0.06 + i * 0.05,
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
                  'size-14',
                  node.favorite &&
                    'ring-2 ring-foreground ring-offset-2 ring-offset-background',
                )}
              />
              <span className="mt-1 text-[11px] font-bold text-muted-foreground">
                {node.name}
              </span>
            </Link>
          </motion.div>
        )
      })}
    </div>
  )
}
