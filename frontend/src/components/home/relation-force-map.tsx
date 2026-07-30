import { RotateCcw, ZoomIn, ZoomOut } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import type { PointerEvent as ReactPointerEvent } from 'react'
import { optimizedImageUrl } from '@/lib/image-url'
import { defaultPersonImageUrl } from '@/lib/default-person-image'
import { formatPersonName } from '@/lib/format'
import { layoutOrganicRelationMap } from '@/lib/relation-map-layout'
import type { RelationMapResponse } from '@/apis/generated/mongle-api.schemas'

type RelationNode = RelationMapResponse['nodes'][number]
type MeNode = RelationMapResponse['me']
type BondEdge = RelationMapResponse['bonds'][number]

/** 사이 선 한 줄 — 양 끝 좌표는 궤도 애니메이션이 움직인 뒤의 값이라 매 프레임 다시 계산된다. */
type BondLine = BondEdge & {
  ax: number
  ay: number
  bx: number
  by: number
}

/** 잡고 있는 동안의 상태. targetId = 지금 놓으면 이어질 상대(없으면 null). */
type BondDrag = {
  pointerId: number
  sourceId: number
  x: number
  y: number
  targetId: number | null
}

type BondMenu = BondEdge & {
  left: number
  top: number
}

/** 인물 노드가 잡기 제스처를 화면 레이어로 되돌려 보내는 통로. 궤도 그래프에서만 넘긴다. */
type BondDragHandlers = {
  onPointerDown: (
    event: ReactPointerEvent<HTMLElement>,
    personId: number,
  ) => void
  onPointerMove: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerUp: (event: ReactPointerEvent<HTMLElement>) => void
  onPointerCancel: () => void
}

type GraphPerson = RelationNode & {
  categoryLabel: string
  color: string
  imageSrc: string
  size: number
  x: number
  y: number
}

type NodeDetailLevel = 'compact' | 'default' | 'expanded'

type CategoryMeta = {
  label: string
  color: string
}

const GRAPH_COUNT = 3
// 지도를 밀려는 손가락과 사람을 집으려는 손가락을 가르는 값. 이 시간을 버텨야 잡기로 친다(PRD 01 §11.2).
const LONG_PRESS_MS = 320
const LONG_PRESS_MOVE_TOLERANCE = 8
// 사이 선은 얇아 그대로는 못 누른다 — 투명한 굵은 선을 겹쳐 손가락 크기의 히트 영역을 만든다(viewBox 100 기준).
const BOND_HIT_STROKE = 4.2
const PAN_THRESHOLD = 6
const SWIPE_THRESHOLD = 42
const SWIPE_VERTICAL_TOLERANCE = 1.35
const SWIPE_MAX_SCALE = 1.08
const PERSON_NODE_SIZE = 56
const MIN_ZOOM = 0.78
const MAX_ZOOM = 2.2
const ZOOM_STEP = 0.18
const MIN_ZOOMED_OUT_NODE_SCALE = 0.9
const ORBIT_CENTER = { x: 50, y: 50 }
const CATEGORY_COLORS = ['#2f6eea', '#28b945', '#ff8a00', '#e11d48']
const HEX_COLOR_PATTERN = /^#[0-9a-f]{6}$/i
const CATEGORY_PERSON_OFFSETS = [
  { x: 0, y: -7 },
  { x: -7, y: 2 },
  { x: 7, y: 2 },
  { x: 0, y: 7 },
]
const FLOW_POSITIONS = [
  { x: 24, y: 22 },
  { x: 76, y: 34 },
  { x: 30, y: 48 },
  { x: 72, y: 61 },
  { x: 48, y: 76 },
  { x: 22, y: 68 },
  { x: 78, y: 78 },
]

export function RelationForceMap({
  me,
  nodes,
  edges: _edges,
  bonds,
  onSelectPerson,
  onConnectBond,
  onDisconnectBond,
  onDuplicateBond,
  bondPending,
}: {
  me: RelationMapResponse['me']
  nodes: RelationMapResponse['nodes']
  edges: RelationMapResponse['edges']
  bonds: RelationMapResponse['bonds']
  onSelectPerson: (personId: number) => void
  onConnectBond: (personAId: number, personBId: number) => void
  onDisconnectBond: (bondId: number) => void
  /** 이미 이어진 상대에 놓았을 때. 문구는 화면 레이어가 고른다. */
  onDuplicateBond: () => void
  bondPending: boolean
}) {
  const containerRef = useRef<HTMLDivElement>(null)
  const graphRef = useRef<HTMLDivElement>(null)
  // 롱프레스 판정 중인 포인터. 잡기로 승격되면 비우고 drag 로 옮긴다.
  const longPressRef = useRef<{
    timer: number
    pointerId: number
    personId: number
    startX: number
    startY: number
  } | null>(null)
  const pointerPositionsRef = useRef(
    new Map<number, { x: number; y: number }>(),
  )
  const activePointerRef = useRef<{
    id: number
    startX: number
    startY: number
    lastX: number
    lastY: number
  } | null>(null)
  const pinchRef = useRef<{ distance: number; scale: number } | null>(null)
  const suppressClickRef = useRef(false)
  const [activeGraphIndex, setActiveGraphIndex] = useState(0)
  const [orbitTime, setOrbitTime] = useState(0)
  const [viewport, setViewport] = useState({ scale: 1, x: 0, y: 0 })
  const [drag, setDrag] = useState<BondDrag | null>(null)
  const [menu, setMenu] = useState<BondMenu | null>(null)
  const categories = useMemo(() => buildCategories(nodes), [nodes])
  const bondedIds = useMemo(
    () => new Set(bonds.flatMap((bond) => [bond.personAId, bond.personBId])),
    [bonds],
  )
  const bondPairKeys = useMemo(
    () =>
      new Set(bonds.map((bond) => bondPairKey(bond.personAId, bond.personBId))),
    [bonds],
  )
  const orbitPeople = useMemo(
    () => buildOrbitPeople(nodes, categories, bondedIds),
    [bondedIds, categories, nodes],
  )
  const animatedOrbitPeople = useMemo(
    () => animateOrbitPeople(orbitPeople, orbitTime),
    [orbitPeople, orbitTime],
  )
  const clusterPeople = useMemo(
    () => buildClusterPeople(nodes, categories),
    [categories, nodes],
  )
  const flowPeople = useMemo(
    () => buildFlowPeople(nodes, categories),
    [categories, nodes],
  )
  const nodeDetailLevel = useMemo(
    () => detailLevelForScale(viewport.scale),
    [viewport.scale],
  )

  // 선을 노드 원 바깥에서 끊으려면 노드 지름(px)을 viewBox 단위로 환산해야 해서 실제 박스 폭이 필요하다.
  const [graphWidth, setGraphWidth] = useState(0)
  useEffect(() => {
    const element = graphRef.current
    if (!element) return
    // 변형(scale)이 걸린 rect 가 아니라 원본 폭을 본다 — 좌표계는 변형 전 기준이다.
    const measure = () => setGraphWidth(element.offsetWidth)
    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(element)
    return () => observer.disconnect()
  }, [])

  const bondLines = useMemo(
    () =>
      buildBondLines(bonds, animatedOrbitPeople, viewport.scale, graphWidth),
    [animatedOrbitPeople, bonds, graphWidth, viewport.scale],
  )
  const nameById = useMemo(
    () => new Map(nodes.map((node) => [node.id, formatPersonName(node)])),
    [nodes],
  )
  const isDragging = drag !== null
  // 메뉴는 선 중간에 붙어 있어 궤도가 계속 돌면 앵커가 어긋난다. 잡는 동안·메뉴가 열린 동안은 궤도를 멈춘다.
  const orbitFrozen = isDragging || menu !== null

  const cancelLongPress = () => {
    if (!longPressRef.current) return
    window.clearTimeout(longPressRef.current.timer)
    longPressRef.current = null
  }

  /** 화면 좌표 → 그래프 박스 안의 % 좌표. 박스에 회전이 없어 시각 rect 만으로 환산된다(줌·팬 포함). */
  const toGraphPercent = (clientX: number, clientY: number) => {
    const rect = graphRef.current?.getBoundingClientRect()
    if (!rect || rect.width === 0 || rect.height === 0) return { x: 50, y: 50 }
    return {
      x: ((clientX - rect.left) / rect.width) * 100,
      y: ((clientY - rect.top) / rect.height) * 100,
    }
  }

  const handleNodePointerDown = (
    event: ReactPointerEvent<HTMLElement>,
    personId: number,
  ) => {
    if (event.button !== 0 || bondPending) return
    // currentTarget 은 핸들러가 끝나면 비워지므로 타이머가 쓸 참조를 지금 붙잡아 둔다.
    const element = event.currentTarget
    const { pointerId, clientX, clientY } = event
    cancelLongPress()
    longPressRef.current = {
      pointerId,
      personId,
      startX: clientX,
      startY: clientY,
      timer: window.setTimeout(() => {
        longPressRef.current = null
        element.setPointerCapture(pointerId)
        // 잡기로 승격된 포인터는 클릭으로 이어지지 않는다 — 이으면서 그 사람 화면까지 열리면 안 된다.
        suppressClickRef.current = true
        setDrag({
          pointerId,
          sourceId: personId,
          ...toGraphPercent(clientX, clientY),
          targetId: null,
        })
      }, LONG_PRESS_MS),
    }
  }

  const handleNodePointerMove = (event: ReactPointerEvent<HTMLElement>) => {
    const pending = longPressRef.current
    if (pending && pending.pointerId === event.pointerId) {
      const moved = Math.hypot(
        event.clientX - pending.startX,
        event.clientY - pending.startY,
      )
      // 밀려는 의도를 잡기로 오해하지 않는다.
      if (moved > LONG_PRESS_MOVE_TOLERANCE) cancelLongPress()
      return
    }

    if (!drag || drag.pointerId !== event.pointerId) return
    const point = toGraphPercent(event.clientX, event.clientY)
    const hovered = personIdAtPoint(event.clientX, event.clientY)
    setDrag((current) =>
      current
        ? {
            ...current,
            ...point,
            targetId: hovered === current.sourceId ? null : hovered,
          }
        : current,
    )
  }

  const handleNodePointerUp = (event: ReactPointerEvent<HTMLElement>) => {
    cancelLongPress()
    if (!drag || drag.pointerId !== event.pointerId) return

    const dropped = personIdAtPoint(event.clientX, event.clientY)
    setDrag(null)
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }

    // 빈 곳·자기 자신에 놓으면 아무 일도 없다(PRD 01 §11.2).
    if (dropped == null || dropped === drag.sourceId) return
    if (bondPending) return
    if (bondPairKeys.has(bondPairKey(drag.sourceId, dropped))) {
      onDuplicateBond()
      return
    }
    onConnectBond(drag.sourceId, dropped)
  }

  const handleNodePointerCancel = () => {
    cancelLongPress()
    setDrag(null)
  }

  /** 선 중점을 지도 컨테이너 기준 px 로 바꿔 메뉴를 붙인다(변형된 그래프 박스 밖에 띄워 줌에 딸려가지 않게). */
  const openBondMenu = (line: BondLine) => {
    const graphRect = graphRef.current?.getBoundingClientRect()
    const containerRect = containerRef.current?.getBoundingClientRect()
    if (!graphRect || !containerRect) return

    const midX = (line.ax + line.bx) / 2
    const midY = (line.ay + line.by) / 2
    setMenu({
      id: line.id,
      personAId: line.personAId,
      personBId: line.personBId,
      left: clampWithin(
        graphRect.left + (midX / 100) * graphRect.width - containerRect.left,
        containerRect.width,
      ),
      top: clampWithin(
        graphRect.top + (midY / 100) * graphRect.height - containerRect.top,
        containerRect.height,
      ),
    })
  }

  const resetViewport = () => setViewport({ scale: 1, x: 0, y: 0 })
  const zoomBy = (delta: number) =>
    setViewport((current) => ({
      ...current,
      scale: clampZoom(current.scale + delta),
    }))
  const showPreviousGraph = () =>
    setActiveGraphIndex((current) => Math.max(0, current - 1))
  const showNextGraph = () =>
    setActiveGraphIndex((current) => Math.min(GRAPH_COUNT - 1, current + 1))
  const openPersonTimeline = (personId: number) => {
    if (suppressClickRef.current) {
      suppressClickRef.current = false
      return
    }

    onSelectPerson(personId)
  }

  useEffect(() => {
    if (activeGraphIndex !== 0) return
    if (orbitFrozen) return
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

    let frameId = 0
    let lastFrame = 0
    const startedAt = performance.now()

    const animate = (now: number) => {
      if (now - lastFrame > 33) {
        setOrbitTime((now - startedAt) / 1000)
        lastFrame = now
      }
      frameId = window.requestAnimationFrame(animate)
    }

    frameId = window.requestAnimationFrame(animate)

    return () => window.cancelAnimationFrame(frameId)
  }, [activeGraphIndex, orbitFrozen])

  useEffect(() => {
    resetViewport()
    pointerPositionsRef.current.clear()
    activePointerRef.current = null
    pinchRef.current = null
    suppressClickRef.current = false
    // cancelLongPress 는 ref 만 건드리므로 렌더마다 새로 만들어져도 안전하다(의존성에 넣지 않는다).
    cancelLongPress()
    setDrag(null)
    setMenu(null)
  }, [activeGraphIndex])

  return (
    <div
      ref={containerRef}
      className="relative mt-0 h-[480px] touch-pan-y overflow-hidden bg-background select-none"
      onPointerDown={(event) => {
        if (event.button !== 0) return
        if (isPersonNodeTarget(event.target)) return
        // 잡고 있는 동안 두 번째 손가락이 핀치줌을 열지 못하게 막는다(PRD 01 §11.2 — 잡기가 지도 조작을 잠근다).
        if (isDragging) return

        event.currentTarget.setPointerCapture(event.pointerId)
        pointerPositionsRef.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        })

        if (pointerPositionsRef.current.size === 1) {
          activePointerRef.current = {
            id: event.pointerId,
            startX: event.clientX,
            startY: event.clientY,
            lastX: event.clientX,
            lastY: event.clientY,
          }
          pinchRef.current = null
        }

        if (pointerPositionsRef.current.size === 2) {
          const pointers = Array.from(pointerPositionsRef.current.values())
          pinchRef.current = {
            distance: pointerDistance(pointers[0], pointers[1]),
            scale: viewport.scale,
          }
          activePointerRef.current = null
          suppressClickRef.current = true
        }
      }}
      onPointerMove={(event) => {
        if (!pointerPositionsRef.current.has(event.pointerId)) return

        pointerPositionsRef.current.set(event.pointerId, {
          x: event.clientX,
          y: event.clientY,
        })

        if (pointerPositionsRef.current.size >= 2 && pinchRef.current) {
          const pointers = Array.from(pointerPositionsRef.current.values())
          const distance = pointerDistance(pointers[0], pointers[1])
          const nextScale = clampZoom(
            pinchRef.current.scale * (distance / pinchRef.current.distance),
          )
          suppressClickRef.current = true
          setViewport((current) => ({ ...current, scale: nextScale }))
          return
        }

        const activePointer = activePointerRef.current
        if (!activePointer || activePointer.id !== event.pointerId) return

        const totalDelta = Math.hypot(
          event.clientX - activePointer.startX,
          event.clientY - activePointer.startY,
        )
        const deltaX = event.clientX - activePointer.lastX
        const deltaY = event.clientY - activePointer.lastY
        activePointerRef.current = {
          ...activePointer,
          lastX: event.clientX,
          lastY: event.clientY,
        }

        if (totalDelta < PAN_THRESHOLD) return

        suppressClickRef.current = true

        if (
          isGraphSwipeGesture(
            event.clientX - activePointer.startX,
            event.clientY - activePointer.startY,
            viewport.scale,
          )
        ) {
          return
        }

        setViewport((current) => ({
          ...current,
          x: clampPan(current.x + deltaX),
          y: clampPan(current.y + deltaY),
        }))
      }}
      onPointerUp={(event) => {
        const activePointer = activePointerRef.current
        if (activePointer?.id === event.pointerId) {
          const deltaX = event.clientX - activePointer.startX
          const deltaY = event.clientY - activePointer.startY

          if (isGraphSwipeGesture(deltaX, deltaY, viewport.scale)) {
            suppressClickRef.current = true
            if (deltaX < 0) showNextGraph()
            if (deltaX > 0) showPreviousGraph()
          }
        }

        pointerPositionsRef.current.delete(event.pointerId)
        activePointerRef.current = null
        pinchRef.current = null

        if (event.currentTarget.hasPointerCapture(event.pointerId)) {
          event.currentTarget.releasePointerCapture(event.pointerId)
        }

        const remainingPointer = pointerPositionsRef.current.entries().next()
        if (!remainingPointer.done) {
          const [id, pointer] = remainingPointer.value
          activePointerRef.current = {
            id,
            startX: pointer.x,
            startY: pointer.y,
            lastX: pointer.x,
            lastY: pointer.y,
          }
        }

        if (suppressClickRef.current) {
          window.setTimeout(() => {
            suppressClickRef.current = false
          }, 0)
        }
      }}
      onPointerCancel={() => {
        pointerPositionsRef.current.clear()
        activePointerRef.current = null
        pinchRef.current = null
        suppressClickRef.current = false
      }}
      onWheel={(event) => {
        event.preventDefault()
        zoomBy(event.deltaY > 0 ? -ZOOM_STEP : ZOOM_STEP)
      }}
    >
      <div
        className="absolute top-2 right-3 z-30 flex items-center gap-1 rounded-full bg-background/82 p-1 shadow-e3 backdrop-blur-sm"
        onPointerDown={(event) => event.stopPropagation()}
      >
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => zoomBy(-ZOOM_STEP)}
          aria-label="축소"
        >
          <ZoomOut className="size-4" />
        </button>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={resetViewport}
          aria-label="원래 크기"
        >
          <RotateCcw className="size-4" />
        </button>
        <button
          type="button"
          className="grid size-8 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
          onClick={() => zoomBy(ZOOM_STEP)}
          aria-label="확대"
        >
          <ZoomIn className="size-4" />
        </button>
      </div>

      <div className="absolute inset-x-0 bottom-12 z-20 flex justify-center px-4">
        <div className="flex max-w-[80%] items-center justify-center gap-2 overflow-hidden rounded-full bg-muted/78 px-2.5 py-1.5 shadow-e2 backdrop-blur-sm">
          {categories.map((category) => (
            <span
              key={category.label}
              data-amp-mask
              // text-zinc-700/200은 foreground와 muted-foreground 사이 값이라 전용 토큰 나오기 전까지 손튜닝 값으로 둔다
              className="inline-flex min-w-0 items-center gap-1 text-[10px] font-bold text-zinc-700 dark:text-zinc-200"
            >
              <span
                className="size-2 shrink-0 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              <span className="max-w-[3.6rem] truncate">{category.label}</span>
            </span>
          ))}
        </div>
      </div>
      <div className="flex h-full touch-none cursor-grab items-center justify-center pb-12 active:cursor-grabbing">
        <div
          ref={graphRef}
          className="relative aspect-square w-full max-w-[600px] transition-transform duration-100 ease-out will-change-transform"
          style={{
            transform: `translate3d(${viewport.x}px, ${viewport.y}px, 0) scale(${viewport.scale})`,
            transformOrigin: '50% 50%',
          }}
        >
          {activeGraphIndex === 0 ? (
            <OrbitGraph
              me={me}
              people={animatedOrbitPeople}
              detailLevel={nodeDetailLevel}
              viewportScale={viewport.scale}
              onPersonClick={openPersonTimeline}
              bondLines={bondLines}
              drag={drag}
              onBondLineClick={openBondMenu}
              bondHandlers={{
                onPointerDown: handleNodePointerDown,
                onPointerMove: handleNodePointerMove,
                onPointerUp: handleNodePointerUp,
                onPointerCancel: handleNodePointerCancel,
              }}
            />
          ) : null}
          {activeGraphIndex === 1 ? (
            <CategoryClusterGraph
              people={clusterPeople}
              categories={categories}
              detailLevel={nodeDetailLevel}
              viewportScale={viewport.scale}
              onPersonClick={openPersonTimeline}
            />
          ) : null}
          {activeGraphIndex === 2 ? (
            <RecentFlowGraph
              people={flowPeople}
              detailLevel={nodeDetailLevel}
              viewportScale={viewport.scale}
              onPersonClick={openPersonTimeline}
            />
          ) : null}
        </div>
      </div>

      <div className="absolute right-0 bottom-2 left-0 z-20 flex flex-col items-center gap-3 px-4">
        {/* 지도 컨테이너가 pointerdown에서 setPointerCapture를 걸면 click이 컨테이너로
            리타게팅되어 버튼 onClick이 무시된다. 줌 컨트롤과 동일하게 전파를 차단한다. */}
        <div
          className="flex justify-center gap-3"
          onPointerDown={(event) => event.stopPropagation()}
        >
          {Array.from({ length: GRAPH_COUNT }).map((_, index) => (
            <button
              key={index}
              type="button"
              className="-m-1.5 p-1.5"
              onClick={() => setActiveGraphIndex(index)}
              aria-label={`그래프 ${index + 1}`}
            >
              {/* 비활성 도트 bg-zinc-300/700은 전용 토큰 나오기 전까지 손튜닝 값으로 둔다 */}
              <span
                className={`block size-2.5 rounded-full transition-colors ${
                  activeGraphIndex === index
                    ? 'bg-foreground'
                    : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              />
            </button>
          ))}
        </div>
      </div>

      {/* 사이를 하나라도 이으면 사라지는 안내 — 잇는 법이 드래그뿐이라 첫 사용자가 알 길이 없다(PRD 01 §6). */}
      {activeGraphIndex === 0 && nodes.length >= 2 && bonds.length === 0 ? (
        <p className="pointer-events-none absolute inset-x-4 bottom-[4.75rem] z-20 text-center text-caption font-medium text-muted-foreground">
          사람을 꾹 눌러 다른 사람 위로 옮기면 사이를 이을 수 있어요.
        </p>
      ) : null}

      {menu ? (
        <>
          {/* 메뉴 밖 아무 곳이나 누르면 닫힌다. 열려 있는 동안 지도 조작을 덮어 앵커가 어긋나지 않게 한다. */}
          <button
            type="button"
            aria-label="메뉴 닫기"
            className="absolute inset-0 z-40 cursor-default"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={() => setMenu(null)}
          />
          <div
            role="menu"
            className="absolute z-50 -translate-x-1/2 -translate-y-1/2 rounded-lg border border-border bg-card p-2 shadow-e4"
            style={{ left: menu.left, top: menu.top }}
            onPointerDown={(event) => event.stopPropagation()}
          >
            <p
              data-amp-mask
              className="max-w-44 truncate px-1.5 pb-1.5 text-caption font-bold text-muted-foreground"
            >
              {nameById.get(menu.personAId) ?? '알 수 없음'} —{' '}
              {nameById.get(menu.personBId) ?? '알 수 없음'}
            </p>
            <button
              type="button"
              role="menuitem"
              disabled={bondPending}
              className="w-full rounded-md px-2.5 py-1.5 text-left text-sm font-bold text-destructive transition-colors hover:bg-accent disabled:opacity-50"
              onClick={() => {
                setMenu(null)
                onDisconnectBond(menu.id)
              }}
            >
              사이 끊기
            </button>
          </div>
        </>
      ) : null}
    </div>
  )
}

function OrbitGraph({
  me,
  people,
  detailLevel,
  viewportScale,
  onPersonClick,
  bondLines,
  drag,
  onBondLineClick,
  bondHandlers,
}: {
  me: MeNode
  people: GraphPerson[]
  detailLevel: NodeDetailLevel
  viewportScale: number
  onPersonClick: (personId: number) => void
  bondLines: BondLine[]
  drag: BondDrag | null
  onBondLineClick: (line: BondLine) => void
  bondHandlers: BondDragHandlers
}) {
  const imageSrc = meImageUrl(me)
  const dragSource = drag
    ? people.find((person) => person.id === drag.sourceId)
    : undefined

  return (
    <>
      <OrbitBackground />
      <BondLayer
        lines={bondLines}
        drag={drag}
        dragOrigin={dragSource ? { x: dragSource.x, y: dragSource.y } : null}
        onLineClick={onBondLineClick}
      />
      <div className="absolute top-1/2 left-1/2 z-20 flex -translate-x-1/2 -translate-y-[38px] flex-col items-center">
        <div className="grid size-[76px] place-items-center rounded-full bg-background shadow-[0_0_0_1px_rgba(24,24,27,0.04),0_0_44px_rgba(255,198,109,0.58),0_0_82px_rgba(255,220,156,0.32)] dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_46px_rgba(255,198,109,0.34),0_0_84px_rgba(255,220,156,0.18)]">
          <img
            src={imageSrc}
            alt={`${me.name} 프로필`}
            className="size-[62px] rounded-full object-cover shadow-e3"
            onError={(event) => {
              const target = event.currentTarget
              if (target.dataset.fallback === '1') return
              target.dataset.fallback = '1'
              target.src = defaultPersonImageUrl({
                id: me.id,
                name: me.name,
                gender: me.avatarGender,
              })
            }}
            data-fallback={imageSrc.startsWith('/default-people/') ? '1' : '0'}
          />
        </div>
        <span
          data-amp-mask
          className="mt-1.5 max-w-24 truncate rounded-full bg-background/88 px-2 py-1 text-[12px] leading-none font-black text-foreground shadow-e1 backdrop-blur-sm"
        >
          {me.name}
        </span>
      </div>
      {people.map((person) => (
        <PersonNode
          key={person.id}
          person={person}
          detailLevel={detailLevel}
          viewportScale={viewportScale}
          onClick={() => onPersonClick(person.id)}
          bondHandlers={bondHandlers}
          highlight={
            drag?.sourceId === person.id
              ? 'source'
              : drag?.targetId === person.id
                ? 'target'
                : null
          }
        />
      ))}
    </>
  )
}

/**
 * 사이 선 층. 얇은 실선 위에 투명한 굵은 선을 겹쳐 손가락으로 누를 수 있게 한다.
 * 루트 svg 는 pointer-events 를 끄고 히트 선에서만 되살린다 — 지도 전체를 덮어 팬을 먹지 않게.
 */
function BondLayer({
  lines,
  drag,
  dragOrigin,
  onLineClick,
}: {
  lines: BondLine[]
  drag: BondDrag | null
  dragOrigin: { x: number; y: number } | null
  onLineClick: (line: BondLine) => void
}) {
  return (
    <svg
      viewBox="0 0 100 100"
      className="pointer-events-none absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
    >
      {lines.map((line) => (
        <g key={line.id}>
          {/* 배경 궤도선(가늘고 흐린 회색 점선)과 한눈에 갈리도록 굵고 진한 실선으로 둔다.
              얇게 두면 장식선과 구분되지 않아 사이가 있는지조차 읽히지 않는다. */}
          <line
            x1={line.ax}
            y1={line.ay}
            x2={line.bx}
            y2={line.by}
            className="stroke-primary"
            strokeWidth="1.1"
            strokeLinecap="round"
          />
          {/* 잡는 동안에는 선을 눌러도 반응하지 않는다 — 놓을 자리를 고르는 중이다. */}
          {drag ? null : (
            <line
              x1={line.ax}
              y1={line.ay}
              x2={line.bx}
              y2={line.by}
              stroke="transparent"
              strokeWidth={BOND_HIT_STROKE}
              strokeLinecap="round"
              pointerEvents="stroke"
              className="cursor-pointer"
              // 지도 컨테이너가 pointerdown에서 setPointerCapture를 걸면 click이 컨테이너로
              // 리타게팅되어 이 onClick이 무시된다(줌 컨트롤·도트와 같은 함정).
              onPointerDown={(event) => event.stopPropagation()}
              onClick={() => onLineClick(line)}
            />
          )}
        </g>
      ))}
      {drag && dragOrigin ? (
        <line
          x1={dragOrigin.x}
          y1={dragOrigin.y}
          x2={drag.x}
          y2={drag.y}
          className="stroke-primary"
          strokeWidth="1.1"
          strokeDasharray="1.8 1.8"
          strokeLinecap="round"
        />
      ) : null}
    </svg>
  )
}

function CategoryClusterGraph({
  people,
  categories,
  detailLevel,
  viewportScale,
  onPersonClick,
}: {
  people: GraphPerson[]
  categories: CategoryMeta[]
  detailLevel: NodeDetailLevel
  viewportScale: number
  onPersonClick: (personId: number) => void
}) {
  return (
    <>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        {categories.map((category, index) => {
          const position = categoryClusterPosition(index, categories.length)
          const radius = categoryClusterRadius(categories.length)
          return (
            <g key={category.label}>
              <circle
                cx={position.x}
                cy={position.y}
                r={radius.fill}
                fill={hexToRgba(category.color, 0.08)}
              />
              <circle
                cx={position.x}
                cy={position.y}
                r={radius.stroke}
                fill="none"
                stroke={hexToRgba(category.color, 0.22)}
                strokeDasharray="1.4 1.8"
                strokeWidth="0.5"
              />
            </g>
          )
        })}
      </svg>
      {categories.map((category, index) => {
        const position = categoryClusterPosition(index, categories.length)
        const radius = categoryClusterRadius(categories.length)
        return (
          <span
            key={category.label}
            data-amp-mask
            // text-zinc-700/200은 foreground와 muted-foreground 사이 값이라 전용 토큰 나오기 전까지 손튜닝 값으로 둔다
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-background/80 px-2 py-1 text-caption font-black text-zinc-700 shadow-e2 dark:text-zinc-200"
            style={{
              left: `${position.x}%`,
              top: `${position.y + radius.labelOffset}%`,
            }}
          >
            {category.label}
          </span>
        )
      })}
      {people.map((person) => (
        <PersonNode
          key={person.id}
          person={person}
          detailLevel={detailLevel}
          viewportScale={viewportScale}
          onClick={() => onPersonClick(person.id)}
        />
      ))}
    </>
  )
}

function RecentFlowGraph({
  people,
  detailLevel,
  viewportScale,
  onPersonClick,
}: {
  people: GraphPerson[]
  detailLevel: NodeDetailLevel
  viewportScale: number
  onPersonClick: (personId: number) => void
}) {
  const path = flowPathForPeople(people)
  return (
    <>
      <svg
        viewBox="0 0 100 100"
        className="absolute inset-0 h-full w-full"
        preserveAspectRatio="none"
        aria-hidden
      >
        {/* flow-path stroke는 모드별 알파를 손으로 맞춘 값이라 전용 토큰 나오기 전까지 유지한다 */}
        <path
          d={path}
          fill="none"
          className="stroke-zinc-950/25 dark:stroke-zinc-100/30"
          strokeWidth="0.38"
          strokeLinecap="round"
        />
        <path
          d={path}
          fill="none"
          className="stroke-zinc-950/12 dark:stroke-zinc-100/16"
          strokeDasharray="1.6 2.2"
          strokeWidth="1.1"
          strokeLinecap="round"
        />
      </svg>
      {people.map((person) => (
        <PersonNode
          key={person.id}
          person={person}
          detailLevel={detailLevel}
          viewportScale={viewportScale}
          onClick={() => onPersonClick(person.id)}
        />
      ))}
    </>
  )
}

function OrbitBackground() {
  return (
    <svg
      viewBox="0 0 100 100"
      className="absolute inset-0 h-full w-full"
      preserveAspectRatio="none"
      aria-hidden
    >
      <defs>
        <radialGradient id="relationCoreGlow" cx="50%" cy="50%" r="38%">
          <stop offset="0%" stopColor="rgba(255,211,144,0.78)" />
          <stop offset="48%" stopColor="rgba(255,211,144,0.3)" />
          <stop offset="100%" stopColor="rgba(255,211,144,0)" />
        </radialGradient>
        <radialGradient id="relationPlanet" cx="36%" cy="28%" r="62%">
          <stop offset="0%" stopColor="#ffffff" />
          <stop offset="55%" stopColor="#e8e1d6" />
          <stop offset="100%" stopColor="#b7aa97" />
        </radialGradient>
      </defs>
      <ellipse cx="50" cy="50" rx="34" ry="23" fill="url(#relationCoreGlow)" />
      {/* 궤도선 stroke-stone은 따뜻한 색감으로 손튜닝한 값이라 무채색 토큰으로 치환하지 않는다 */}
      <ellipse
        cx="50"
        cy="50"
        rx="18"
        ry="12"
        fill="none"
        className="stroke-stone-300/32 dark:stroke-stone-100/14"
        strokeWidth="0.35"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="38"
        ry="21"
        fill="none"
        className="stroke-stone-700/24 dark:stroke-stone-100/22"
        strokeWidth="0.34"
        transform="rotate(-16 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="42"
        ry="27"
        fill="none"
        className="stroke-stone-700/14 dark:stroke-stone-100/14"
        strokeDasharray="1.4 1.8"
        strokeWidth="0.32"
        transform="rotate(13 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="47"
        ry="32"
        fill="none"
        className="stroke-stone-700/20 dark:stroke-stone-100/18"
        strokeWidth="0.32"
        transform="rotate(-28 50 50)"
      />
      <ellipse
        cx="50"
        cy="50"
        rx="50"
        ry="26"
        fill="none"
        className="stroke-stone-700/14 dark:stroke-stone-100/12"
        strokeDasharray="1.3 2"
        strokeWidth="0.3"
        transform="rotate(34 50 50)"
      />
      <circle cx="12" cy="66" r="2.3" fill="url(#relationPlanet)" />
      <circle cx="30" cy="83" r="2.4" fill="url(#relationPlanet)" />
      <circle cx="68" cy="69" r="1.8" fill="url(#relationPlanet)" />
      <circle cx="73" cy="36" r="1.7" fill="url(#relationPlanet)" />
      <circle cx="86" cy="57" r="2" fill="url(#relationPlanet)" />
    </svg>
  )
}

function PersonNode({
  person,
  detailLevel,
  viewportScale,
  onClick,
  bondHandlers,
  highlight,
}: {
  person: GraphPerson
  detailLevel: NodeDetailLevel
  viewportScale: number
  onClick: () => void
  /** 없으면 잡기 제스처를 받지 않는다 — 궤도 그래프 밖에서는 사이를 잇지 않는다. */
  bondHandlers?: BondDragHandlers
  highlight?: 'source' | 'target' | null
}) {
  const nodeSize = scaledPersonNodeSize(person.size, viewportScale)
  const showText = detailLevel !== 'compact'
  const showLastMeet = detailLevel === 'expanded'
  const displayName = formatPersonName(person)

  return (
    <button
      type="button"
      data-person-node
      data-person-id={person.id}
      onClick={onClick}
      onPointerDown={
        bondHandlers
          ? (event) => bondHandlers.onPointerDown(event, person.id)
          : undefined
      }
      onPointerMove={bondHandlers?.onPointerMove}
      onPointerUp={bondHandlers?.onPointerUp}
      onPointerCancel={
        bondHandlers ? () => bondHandlers.onPointerCancel() : undefined
      }
      // 버튼 상자를 아바타 크기로 못박는다. 이름표까지 상자에 넣으면 사람 하나가 제 크기의 두 배쯤 되는
      // 사각형으로 주변을 덮어, 두 사람 사이에 그은 사이 선을 눌러도 노드가 먼저 먹는다(선을 끊을 수 없게 된다).
      className={`group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center outline-none transition-transform duration-200 hover:z-40 hover:scale-[1.03] focus-visible:z-40 ${
        highlight ? 'z-40 scale-105' : ''
      }`}
      style={{
        left: `${person.x}%`,
        top: `${person.y}%`,
        width: `${nodeSize}px`,
        height: `${nodeSize}px`,
      }}
      aria-label={`${displayName} 상세`}
    >
      <span
        className={`relative grid place-items-center rounded-full border-[3px] bg-background shadow-e2 ring-1 ring-border ${
          highlight === 'target'
            ? 'ring-[3px] ring-primary'
            : highlight === 'source'
              ? 'ring-2 ring-primary/60'
              : ''
        }`}
        style={{
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
          borderColor: person.color,
        }}
      >
        <img
          src={person.imageSrc}
          alt={person.name}
          // 이미지의 기본 드래그가 켜져 있으면 꾹 눌러 끄는 순간 네이티브 드래그가 시작되고,
          // 브라우저가 pointercancel 을 쏘아 잡기가 통째로 취소된다.
          draggable={false}
          className="size-[76%] rounded-full object-cover"
          onError={(event) => {
            const target = event.currentTarget
            if (target.dataset.fallback === '1') return
            target.dataset.fallback = '1'
            target.src = defaultPersonImageUrl({
              id: person.id,
              name: person.name,
              gender: readExplicitGender(person),
            })
          }}
          data-fallback={
            person.imageSrc.startsWith('/default-people/') ? '1' : '0'
          }
        />
      </span>
      {/* 이름표는 상자 밖으로 띄우고 클릭을 받지 않는다 — 눌리는 곳은 아바타뿐이다(위 주석). */}
      <span className="pointer-events-none absolute top-full left-1/2 mt-1.5 flex w-max max-w-[7.25rem] -translate-x-1/2 flex-col items-center">
        {showText ? (
          <span
            data-amp-mask
            className="flex max-w-full items-center gap-1 rounded-full bg-background/86 px-1.5 py-0.5 text-[12px] leading-none font-black text-foreground shadow-e1 backdrop-blur-sm"
          >
            <span className="min-w-0 truncate">{displayName}</span>
            <span
              className="max-w-[3.4rem] shrink-0 truncate rounded-full px-1 py-0.5 text-[9px] font-extrabold text-white"
              style={{ backgroundColor: person.color }}
            >
              {person.categoryLabel}
            </span>
          </span>
        ) : null}
        {showLastMeet && person.intimacy.daysSinceLastMeet != null ? (
          <span className="mt-1 text-caption leading-none font-medium text-muted-foreground">
            {formatDaysSinceLastMeet(person.intimacy.daysSinceLastMeet)}
          </span>
        ) : null}
      </span>
    </button>
  )
}

function buildOrbitPeople(
  nodes: RelationNode[],
  categories: CategoryMeta[],
  bondedIds: Set<number>,
): GraphPerson[] {
  const layout = layoutOrganicRelationMap(
    nodes.map((node) => ({
      id: node.id,
      recordCount: node.recordCount,
      // 사이가 없는 사람은 바깥 링으로 밀린다(PRD 01 §11.4). 레이아웃이 판단 근거를 갖게 여기서 넘긴다.
      bonded: bondedIds.has(node.id),
    })),
    ORBIT_CENTER.x,
    ORBIT_CENTER.y,
  )

  return nodes.map((node, index) => {
    const position = layout.persons[index] ?? ORBIT_CENTER
    return toGraphPerson(node, categories, position.x, position.y)
  })
}

function animateOrbitPeople(
  people: GraphPerson[],
  elapsedSeconds: number,
): GraphPerson[] {
  if (elapsedSeconds === 0 || people.length === 0) return people

  return people.map((person, index) => {
    const dx = person.x - ORBIT_CENTER.x
    const dy = person.y - ORBIT_CENTER.y
    const angle = Math.atan2(dy, dx)
    const radiusX = Math.max(12, Math.abs(dx) + 7 + (index % 2) * 2)
    const radiusY = Math.max(10, Math.abs(dy) + 5 + (index % 3) * 1.4)
    const direction = index % 2 === 0 ? 1 : -1
    const speed = 0.026 + (index % 4) * 0.004
    const nextAngle = angle + elapsedSeconds * speed * direction

    return {
      ...person,
      x: ORBIT_CENTER.x + Math.cos(nextAngle) * radiusX,
      y: ORBIT_CENTER.y + Math.sin(nextAngle) * radiusY,
    }
  })
}

function buildClusterPeople(
  nodes: RelationNode[],
  categories: CategoryMeta[],
): GraphPerson[] {
  const categoryCounts = new Map<string, number>()

  return nodes.map((node) => {
    const categoryLabel = primaryCategoryLabel(node)
    const categoryIndex = Math.max(
      categories.findIndex((category) => category.label === categoryLabel),
      0,
    )
    const cluster = categoryClusterPosition(categoryIndex, categories.length)
    const indexInCategory = categoryCounts.get(categoryLabel) ?? 0
    categoryCounts.set(categoryLabel, indexInCategory + 1)

    const offset =
      CATEGORY_PERSON_OFFSETS[indexInCategory % CATEGORY_PERSON_OFFSETS.length]
    const overflowRing = Math.floor(
      indexInCategory / CATEGORY_PERSON_OFFSETS.length,
    )
    const x = cluster.x + offset.x + overflowRing * 3
    const y = cluster.y + offset.y + overflowRing * 3

    return toGraphPerson(node, categories, x, y)
  })
}

function categoryClusterPosition(index: number, total: number) {
  if (total <= 1) return { x: 50, y: 54 }
  if (total === 2)
    return [
      { x: 31, y: 54 },
      { x: 69, y: 54 },
    ][index]
  if (total === 3) {
    return [
      { x: 28, y: 41 },
      { x: 72, y: 41 },
      { x: 50, y: 70 },
    ][index]
  }
  if (total === 4) {
    return [
      { x: 30, y: 38 },
      { x: 70, y: 38 },
      { x: 30, y: 70 },
      { x: 70, y: 70 },
    ][index]
  }

  const columnXs = [20, 50, 80]
  const rowYs = total <= 6 ? [37, 72] : [30, 54, 78]
  const column = index % columnXs.length
  const row = Math.floor(index / columnXs.length) % rowYs.length

  return { x: columnXs[column], y: rowYs[row] }
}

function categoryClusterRadius(total: number) {
  if (total > 6) return { fill: 11, stroke: 13, labelOffset: 13 }
  if (total > 4) return { fill: 14, stroke: 16, labelOffset: 16 }
  return { fill: 15, stroke: 18, labelOffset: 17 }
}

function buildFlowPeople(
  nodes: RelationNode[],
  categories: CategoryMeta[],
): GraphPerson[] {
  return [...nodes]
    .sort(
      (a, b) =>
        (a.intimacy.daysSinceLastMeet ?? Number.MAX_SAFE_INTEGER) -
        (b.intimacy.daysSinceLastMeet ?? Number.MAX_SAFE_INTEGER),
    )
    .map((node, index) => {
      const position = FLOW_POSITIONS[index % FLOW_POSITIONS.length]
      return toGraphPerson(node, categories, position.x, position.y)
    })
}

function toGraphPerson(
  node: RelationNode,
  categories: CategoryMeta[],
  x: number,
  y: number,
): GraphPerson {
  const matchedCategory = categories.find(
    (item) => item.label === primaryCategoryLabel(node),
  )

  return {
    ...node,
    categoryLabel: primaryCategoryLabel(node),
    color:
      matchedCategory?.color ?? stableCategoryColor(primaryCategoryLabel(node)),
    imageSrc: nodeImageUrl(node),
    size: personNodeSize(node.recordCount, node.favorite),
    x,
    y,
  }
}

function buildCategories(nodes: RelationNode[]): CategoryMeta[] {
  const categoriesByLabel = new Map<string, CategoryMeta>()

  for (const node of nodes) {
    const tag = primaryCategory(node)
    const label = tag?.label ?? '기타'
    if (categoriesByLabel.has(label)) continue

    categoriesByLabel.set(label, {
      label,
      color: normalizeCategoryColor(tag?.color, label),
    })
  }

  if (categoriesByLabel.size === 0) {
    categoriesByLabel.set('기타', {
      label: '기타',
      color: stableCategoryColor('기타'),
    })
  }

  return Array.from(categoriesByLabel.values()).sort((a, b) =>
    a.label.localeCompare(b.label, 'ko'),
  )
}

function primaryCategory(node: RelationNode) {
  return node.relationTags.at(0) ?? null
}

function primaryCategoryLabel(node: RelationNode) {
  return primaryCategory(node)?.label ?? '기타'
}

function normalizeCategoryColor(
  color: string | null | undefined,
  label: string,
) {
  if (color && HEX_COLOR_PATTERN.test(color)) return color.toUpperCase()
  return stableCategoryColor(label)
}

function stableCategoryColor(label: string) {
  const index = Math.abs(stableStringHash(label)) % CATEGORY_COLORS.length
  return CATEGORY_COLORS[index]
}

function stableStringHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return hash
}

function personNodeSize(recordCount: number, favorite: boolean) {
  const safeRecordCount = Number.isFinite(recordCount)
    ? Math.max(0, recordCount)
    : 0
  const recordBoost = Math.min(6, Math.sqrt(safeRecordCount) * 1.6)
  return clampPersonNodeSize(
    Math.round(PERSON_NODE_SIZE - 4 + recordBoost + (favorite ? 1 : 0)),
  )
}

function clampPersonNodeSize(size: number) {
  if (!Number.isFinite(size)) return PERSON_NODE_SIZE
  return Math.min(62, Math.max(52, Math.round(size)))
}

function scaledPersonNodeSize(size: number, viewportScale: number) {
  const baseSize = clampPersonNodeSize(size)
  if (!Number.isFinite(viewportScale) || viewportScale >= 1) return baseSize

  const zoomProgress = (1 - viewportScale) / (1 - MIN_ZOOM)
  const scale = 1 - clamp01(zoomProgress) * (1 - MIN_ZOOMED_OUT_NODE_SCALE)
  return Math.round(baseSize * scale)
}

function clampZoom(scale: number) {
  if (!Number.isFinite(scale)) return 1
  return Math.min(MAX_ZOOM, Math.max(MIN_ZOOM, scale))
}

function clamp01(value: number) {
  if (value < 0) return 0
  if (value > 1) return 1
  return value
}

function clampPan(value: number) {
  if (!Number.isFinite(value)) return 0
  return Math.min(120, Math.max(-120, value))
}

function isGraphSwipeGesture(deltaX: number, deltaY: number, scale: number) {
  return (
    scale <= SWIPE_MAX_SCALE &&
    Math.abs(deltaX) >= SWIPE_THRESHOLD &&
    Math.abs(deltaX) > Math.abs(deltaY) * SWIPE_VERTICAL_TOLERANCE
  )
}

function detailLevelForScale(scale: number): NodeDetailLevel {
  if (scale <= 0.86) return 'compact'
  if (scale >= 1.34) return 'expanded'
  return 'default'
}

function pointerDistance(
  first: { x: number; y: number },
  second: { x: number; y: number },
) {
  return Math.hypot(second.x - first.x, second.y - first.y) || 1
}

function isPersonNodeTarget(target: EventTarget | null) {
  return target instanceof Element && target.closest('[data-person-node]')
}

/** 방향 없는 쌍의 키. 서버 저장과 같은 규칙(작은 id 먼저)이라 어느 쪽에서 끌어도 같은 키가 된다. */
function bondPairKey(first: number, second: number) {
  return `${Math.min(first, second)}-${Math.max(first, second)}`
}

/**
 * 사이를 화면 좌표를 가진 선으로 바꾼다.
 * 양쪽 끝이 모두 지금 그려지는 노드일 때만 남긴다 — 기간 토글로 한쪽이 빠지면 허공에 뜬 선이 되기 때문
 * (백엔드는 관계태그 필터만 알고, 기간 필터는 프론트에만 있다).
 *
 * 선은 노드 중심이 아니라 **원 바깥에서** 시작·끝난다. 중심까지 그으면 선의 상당 부분이 노드 밑에 깔리는데,
 * 노드가 선보다 위에 있어 그 구간은 눌러도 반응하지 않는다 — 보이는 구간과 누를 수 있는 구간을 일치시킨다.
 * 두 노드가 겹칠 만큼 붙어 있으면 그릴 여백이 없으므로 아예 내지 않는다(누를 수 없는 유령 히트 영역을 만들지 않는다).
 */
function buildBondLines(
  bonds: BondEdge[],
  people: GraphPerson[],
  viewportScale: number,
  graphWidth: number,
): BondLine[] {
  const positions = new Map(people.map((person) => [person.id, person]))
  // 노드 크기는 px, 선 좌표는 viewBox 100 기준이라 환산이 필요하다. 폭을 아직 모르면 자르지 않는다.
  const radiusUnits = (person: GraphPerson) =>
    graphWidth > 0
      ? ((scaledPersonNodeSize(person.size, viewportScale) / 2 + 2) /
          graphWidth) *
        100
      : 0

  return bonds.flatMap((bond) => {
    const a = positions.get(bond.personAId)
    const b = positions.get(bond.personBId)
    if (!a || !b) return []

    const dx = b.x - a.x
    const dy = b.y - a.y
    const length = Math.hypot(dx, dy)
    const startTrim = radiusUnits(a)
    const endTrim = radiusUnits(b)
    if (length <= startTrim + endTrim) return []

    const ux = dx / length
    const uy = dy / length
    return [
      {
        ...bond,
        ax: a.x + ux * startTrim,
        ay: a.y + uy * startTrim,
        bx: b.x - ux * endTrim,
        by: b.y - uy * endTrim,
      },
    ]
  })
}

/** 손가락 아래에 있는 인물 노드의 id. 따라다니는 선이 pointer-events 를 갖지 않아야 정확하다. */
function personIdAtPoint(clientX: number, clientY: number): number | null {
  const element = document.elementFromPoint(clientX, clientY)
  const node = element?.closest('[data-person-node]')
  const raw = node?.getAttribute('data-person-id')
  if (!raw) return null
  const id = Number(raw)
  return Number.isFinite(id) ? id : null
}

/** 메뉴가 지도 밖으로 새어 나가지 않게 컨테이너 안으로 당긴다. */
function clampWithin(value: number, size: number) {
  const margin = 72
  return Math.min(Math.max(value, margin), Math.max(margin, size - margin))
}

function flowPathForPeople(people: GraphPerson[]) {
  if (people.length === 0) return ''
  return people
    .map((person, index) => {
      if (index === 0) return `M ${person.x} ${person.y}`
      const previous = people[index - 1]
      const midX = (previous.x + person.x) / 2
      return `C ${midX} ${previous.y}, ${midX} ${person.y}, ${person.x} ${person.y}`
    })
    .join(' ')
}

function formatDaysSinceLastMeet(days: number) {
  if (days <= 0) return '오늘'
  if (days < 7) return `${days}일 전`
  if (days < 14) return '1주일 전'
  if (days < 30) return `${Math.max(2, Math.round(days / 7))}주 전`
  if (days < 45) return '1개월 전'
  return `${Math.max(2, Math.round(days / 30))}개월 전`
}

function nodeImageUrl(node: RelationNode) {
  const src = optimizedImageUrl(node.profileImageUrl, 128)
  if (src) return src
  return defaultPersonImageUrl({
    id: node.id,
    name: node.name,
    gender: readExplicitGender(node),
  })
}

function meImageUrl(me: MeNode) {
  if (me.profileImageUrl?.startsWith('/default-people/')) {
    return me.profileImageUrl
  }
  const src = optimizedImageUrl(me.profileImageUrl, 128)
  if (src) return src
  return defaultPersonImageUrl({
    id: me.id,
    name: me.name,
    gender: me.avatarGender,
  })
}

function readExplicitGender(node: Pick<RelationNode, 'name' | 'avatarGender'>) {
  const candidate = node as Pick<RelationNode, 'name' | 'avatarGender'> & {
    gender?: string | null
    sex?: string | null
  }
  const value = (
    candidate.avatarGender ??
    candidate.gender ??
    candidate.sex
  )?.toUpperCase()

  if (!value) return null
  if (['FEMALE', 'WOMAN', 'WOMEN', 'F'].includes(value)) return 'FEMALE'
  if (['MALE', 'MAN', 'MEN', 'M'].includes(value)) return 'MALE'
  return null
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red},${green},${blue},${alpha})`
}
