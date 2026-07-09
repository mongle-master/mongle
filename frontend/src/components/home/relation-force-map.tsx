import { useNavigate } from '@tanstack/react-router'
import { Hand } from 'lucide-react'
import { useEffect, useMemo, useRef, useState } from 'react'
import { mediaUrl } from '@/lib/api/client'
import type { RelationMapResponse } from '@/lib/api/types'

type RelationNode = RelationMapResponse['nodes'][number]

type GraphPerson = RelationNode & {
  color: string
  imageSrc: string
  size: number
  x: number
  y: number
}

type CategoryMeta = {
  label: string
  color: string
}

const GRAPH_COUNT = 3
const DRAG_THRESHOLD = 44
const PERSON_NODE_SIZE = 56
const ORBIT_CENTER = { x: 50, y: 56 }
const CATEGORY_COLORS = ['#2f6eea', '#28b945', '#ff8a00', '#e11d48']
const DEFAULT_FEMALE_PERSON_IMAGES = [
  '/default-people/person-female-1.png',
  '/default-people/person-female-2.png',
  '/default-people/person-female-3.png',
] as const
const DEFAULT_MALE_PERSON_IMAGES = [
  '/default-people/person-male-1.png',
  '/default-people/person-male-2.png',
  '/default-people/person-male-3.png',
] as const
const DEFAULT_PERSON_IMAGES = [
  ...DEFAULT_FEMALE_PERSON_IMAGES,
  ...DEFAULT_MALE_PERSON_IMAGES,
] as const
const DEFAULT_PERSON_GENDER_BY_NAME = new Map<string, 'FEMALE' | 'MALE'>([
  ['유진', 'FEMALE'],
  ['소연', 'FEMALE'],
  ['하은', 'FEMALE'],
  ['재윤', 'MALE'],
  ['지훈', 'MALE'],
  ['민수', 'MALE'],
])
const ORBIT_POSITIONS = [
  { x: 50, y: 25 },
  { x: 24, y: 42 },
  { x: 76, y: 42 },
  { x: 24, y: 66 },
  { x: 50, y: 76 },
  { x: 76, y: 66 },
  { x: 35, y: 32 },
  { x: 65, y: 32 },
]
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
}: {
  me: RelationMapResponse['me']
  nodes: RelationMapResponse['nodes']
  edges: RelationMapResponse['edges']
}) {
  const navigate = useNavigate()
  const dragStartXRef = useRef<number | null>(null)
  const [activeGraphIndex, setActiveGraphIndex] = useState(0)
  const [orbitTime, setOrbitTime] = useState(0)
  const categories = useMemo(() => buildCategories(nodes), [nodes])
  const orbitPeople = useMemo(
    () => buildOrbitPeople(nodes, categories),
    [categories, nodes],
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

  const showPreviousGraph = () =>
    setActiveGraphIndex((current) => Math.max(0, current - 1))
  const showNextGraph = () =>
    setActiveGraphIndex((current) => Math.min(GRAPH_COUNT - 1, current + 1))

  useEffect(() => {
    if (activeGraphIndex !== 0) return
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
  }, [activeGraphIndex])

  return (
    <div
      className="relative mt-0 h-[500px] touch-pan-y overflow-hidden bg-background select-none"
      onPointerDown={(event) => {
        dragStartXRef.current = event.clientX
      }}
      onPointerUp={(event) => {
        const startX = dragStartXRef.current
        dragStartXRef.current = null
        if (startX == null) return

        const delta = event.clientX - startX
        if (Math.abs(delta) < DRAG_THRESHOLD) return
        if (delta < 0) showNextGraph()
        if (delta > 0) showPreviousGraph()
      }}
      onPointerCancel={() => {
        dragStartXRef.current = null
      }}
    >
      <div className="absolute inset-x-0 bottom-22 z-20 flex justify-center px-4">
        <div className="flex max-w-[88%] flex-wrap justify-center gap-3 rounded-full bg-zinc-100/82 px-3.5 py-2 shadow-[0_10px_24px_rgba(24,24,27,0.06)] backdrop-blur-sm dark:bg-zinc-900/82 dark:shadow-[0_10px_24px_rgba(0,0,0,0.28)]">
          {categories.map((category) => (
            <span
              key={category.label}
              className="inline-flex items-center gap-1.5 text-[10.5px] font-bold text-zinc-700 dark:text-zinc-200"
            >
              <span
                className="size-2 rounded-full"
                style={{ backgroundColor: category.color }}
              />
              {category.label}
            </span>
          ))}
        </div>
      </div>
      <div className="-mt-10 flex justify-center">
        <div className="relative aspect-square w-full max-w-[600px]">
          {activeGraphIndex === 0 ? (
            <OrbitGraph
              meLabel={me.label}
              people={animatedOrbitPeople}
              onPersonClick={(personId) =>
                navigate({
                  to: '/people/$personId/timeline',
                  params: { personId: String(personId) },
                })
              }
            />
          ) : null}
          {activeGraphIndex === 1 ? (
            <CategoryClusterGraph
              people={clusterPeople}
              categories={categories}
              onPersonClick={(personId) =>
                navigate({
                  to: '/people/$personId/timeline',
                  params: { personId: String(personId) },
                })
              }
            />
          ) : null}
          {activeGraphIndex === 2 ? (
            <RecentFlowGraph
              people={flowPeople}
              onPersonClick={(personId) =>
                navigate({
                  to: '/people/$personId/timeline',
                  params: { personId: String(personId) },
                })
              }
            />
          ) : null}
        </div>
      </div>

      <div className="absolute right-0 bottom-2 left-0 z-20 flex flex-col items-center gap-3 px-4">
        <div className="flex items-center gap-2 text-[12px] font-medium text-zinc-500 dark:text-zinc-400">
          <Hand className="size-4 -rotate-12 stroke-[1.8]" />
          <span>드래그하여 관계를 탐색해보세요</span>
        </div>

        <div className="flex justify-center gap-3">
          {Array.from({ length: GRAPH_COUNT }).map((_, index) => (
            <button
              key={index}
              type="button"
              className={`size-2.5 rounded-full transition-colors ${
                activeGraphIndex === index
                  ? 'bg-zinc-950 dark:bg-zinc-50'
                  : 'bg-zinc-300 dark:bg-zinc-700'
              }`}
              onClick={() => setActiveGraphIndex(index)}
              aria-label={`그래프 ${index + 1}`}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

function OrbitGraph({
  meLabel,
  people,
  onPersonClick,
}: {
  meLabel: string
  people: GraphPerson[]
  onPersonClick: (personId: number) => void
}) {
  return (
    <>
      <OrbitBackground />
      <div className="absolute top-[56%] left-1/2 grid size-[76px] -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-white shadow-[0_0_0_1px_rgba(24,24,27,0.04),0_0_44px_rgba(255,198,109,0.58),0_0_82px_rgba(255,220,156,0.32)] dark:bg-zinc-950 dark:shadow-[0_0_0_1px_rgba(255,255,255,0.08),0_0_46px_rgba(255,198,109,0.34),0_0_84px_rgba(255,220,156,0.18)]">
        <div className="grid size-[42px] place-items-center rounded-full bg-zinc-950 text-[22px] font-black text-white shadow-[0_10px_20px_rgba(24,24,27,0.22)] dark:bg-white dark:text-zinc-950 dark:shadow-[0_10px_20px_rgba(0,0,0,0.3)]">
          {meLabel}
        </div>
      </div>
      {people.map((person) => (
        <PersonNode
          key={person.id}
          person={person}
          onClick={() => onPersonClick(person.id)}
        />
      ))}
    </>
  )
}

function CategoryClusterGraph({
  people,
  categories,
  onPersonClick,
}: {
  people: GraphPerson[]
  categories: CategoryMeta[]
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
            className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full bg-white/80 px-2 py-1 text-[11px] font-black text-zinc-700 shadow-[0_8px_18px_rgba(24,24,27,0.06)] dark:bg-zinc-950/82 dark:text-zinc-200 dark:shadow-[0_8px_18px_rgba(0,0,0,0.28)]"
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
          onClick={() => onPersonClick(person.id)}
        />
      ))}
    </>
  )
}

function RecentFlowGraph({
  people,
  onPersonClick,
}: {
  people: GraphPerson[]
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
        <radialGradient id="relationCoreGlow" cx="50%" cy="56%" r="38%">
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
      <ellipse cx="50" cy="56" rx="34" ry="23" fill="url(#relationCoreGlow)" />
      <ellipse
        cx="50"
        cy="56"
        rx="18"
        ry="12"
        fill="none"
        className="stroke-stone-300/32 dark:stroke-stone-100/14"
        strokeWidth="0.35"
      />
      <ellipse
        cx="50"
        cy="56"
        rx="38"
        ry="21"
        fill="none"
        className="stroke-stone-700/24 dark:stroke-stone-100/22"
        strokeWidth="0.34"
        transform="rotate(-16 50 56)"
      />
      <ellipse
        cx="50"
        cy="56"
        rx="42"
        ry="27"
        fill="none"
        className="stroke-stone-700/14 dark:stroke-stone-100/14"
        strokeDasharray="1.4 1.8"
        strokeWidth="0.32"
        transform="rotate(13 50 56)"
      />
      <ellipse
        cx="50"
        cy="56"
        rx="47"
        ry="32"
        fill="none"
        className="stroke-stone-700/20 dark:stroke-stone-100/18"
        strokeWidth="0.32"
        transform="rotate(-28 50 56)"
      />
      <ellipse
        cx="50"
        cy="56"
        rx="50"
        ry="26"
        fill="none"
        className="stroke-stone-700/14 dark:stroke-stone-100/12"
        strokeDasharray="1.3 2"
        strokeWidth="0.3"
        transform="rotate(34 50 56)"
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
  onClick,
}: {
  person: GraphPerson
  onClick: () => void
}) {
  const nodeSize = clampPersonNodeSize(person.size)

  return (
    <button
      type="button"
      onClick={onClick}
      className="group absolute z-10 flex -translate-x-1/2 -translate-y-1/2 flex-col items-center text-center outline-none transition-transform duration-200 hover:z-40 hover:scale-[1.03] focus-visible:z-40"
      style={{
        left: `${person.x}%`,
        top: `${person.y}%`,
        width: `${nodeSize + 30}px`,
      }}
      aria-label={`${person.name} 상세`}
    >
      <span
        className="relative grid place-items-center rounded-full bg-white ring-1 ring-zinc-200/70 dark:bg-zinc-950 dark:ring-white/10"
        style={{
          width: `${nodeSize}px`,
          height: `${nodeSize}px`,
        }}
      >
        <img
          src={person.imageSrc}
          alt={person.name}
          className="size-[76%] rounded-full object-cover"
          onError={(event) => {
            const target = event.currentTarget
            if (target.dataset.fallback === '1') return
            target.dataset.fallback = '1'
            target.src = fallbackImageForNode(person)
          }}
          data-fallback={
            person.imageSrc.startsWith('/default-people/') ? '1' : '0'
          }
        />
        <span
          className="absolute right-0 bottom-1 size-3.5 rounded-full border-[3px] border-white shadow-[0_4px_8px_rgba(24,24,27,0.16)] dark:border-zinc-950 dark:shadow-[0_4px_8px_rgba(0,0,0,0.38)]"
          style={{ backgroundColor: person.color }}
        />
      </span>
      <span className="mt-1.5 rounded-full bg-background/82 px-1.5 py-0.5 text-[13px] leading-none font-black text-zinc-950 shadow-[0_4px_12px_rgba(24,24,27,0.06)] backdrop-blur-sm dark:text-zinc-50">
        {person.name}
      </span>
      {person.intimacy.daysSinceLastMeet != null ? (
        <span className="mt-1 text-[11px] leading-none font-medium text-zinc-500 dark:text-zinc-400">
          {formatDaysSinceLastMeet(person.intimacy.daysSinceLastMeet)}
        </span>
      ) : null}
    </button>
  )
}

function buildOrbitPeople(
  nodes: RelationNode[],
  categories: CategoryMeta[],
): GraphPerson[] {
  return nodes.map((node, index) => {
    const position = ORBIT_POSITIONS[index % ORBIT_POSITIONS.length]
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
  const categoryIndex = Math.max(
    categories.findIndex(
      (category) => category.label === primaryCategoryLabel(node),
    ),
    0,
  )

  return {
    ...node,
    color: CATEGORY_COLORS[categoryIndex % CATEGORY_COLORS.length],
    imageSrc: nodeImageUrl(node),
    size: personNodeSize(node.recordCount, node.favorite),
    x,
    y,
  }
}

function buildCategories(nodes: RelationNode[]): CategoryMeta[] {
  const labels = Array.from(new Set(nodes.map(primaryCategoryLabel)))
  return (labels.length > 0 ? labels : ['기타']).map((label, index) => ({
    label,
    color: CATEGORY_COLORS[index % CATEGORY_COLORS.length],
  }))
}

function primaryCategoryLabel(node: RelationNode) {
  return node.relationTags.at(0)?.label ?? '기타'
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
  const src = mediaUrl(node.profileImageUrl)
  if (src) return src
  return fallbackImageForNode(node)
}

function fallbackImageForNode(
  node: Pick<RelationNode, 'id' | 'name' | 'avatarGender'>,
) {
  const gender = defaultImageGenderForNode(node)
  const images =
    gender === 'FEMALE'
      ? DEFAULT_FEMALE_PERSON_IMAGES
      : gender === 'MALE'
        ? DEFAULT_MALE_PERSON_IMAGES
        : DEFAULT_PERSON_IMAGES
  const hash = stableStringHash(`${node.id}:${node.name}`)
  return images[Math.abs(hash) % images.length]
}

function defaultImageGenderForNode(
  node: Pick<RelationNode, 'name' | 'avatarGender'>,
) {
  const explicitGender = readExplicitGender(node)
  if (explicitGender) return explicitGender
  return DEFAULT_PERSON_GENDER_BY_NAME.get(node.name.trim()) ?? null
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

function stableStringHash(value: string) {
  let hash = 0
  for (let index = 0; index < value.length; index++) {
    hash = (hash * 31 + value.charCodeAt(index)) | 0
  }
  return hash
}

function hexToRgba(hex: string, alpha: number) {
  const normalized = hex.replace('#', '')
  const red = Number.parseInt(normalized.slice(0, 2), 16)
  const green = Number.parseInt(normalized.slice(2, 4), 16)
  const blue = Number.parseInt(normalized.slice(4, 6), 16)
  return `rgba(${red},${green},${blue},${alpha})`
}
