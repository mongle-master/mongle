import { useNavigate } from '@tanstack/react-router'
import { useEffect, useMemo, useRef, useState } from 'react'
import ForceGraph2D from 'react-force-graph-2d'
import type {
  ForceGraphMethods,
  GraphData,
  LinkObject,
  NodeObject,
} from 'react-force-graph-2d'
import type { RelationMapResponse } from '@/lib/api/types'
import { mediaUrl } from '@/lib/api/client'

type RelationNode = RelationMapResponse['nodes'][number]
type RelationEdge = RelationMapResponse['edges'][number]

type GraphNodeData = Omit<RelationNode, 'id'> & {
  id: number
  val: number
  distant: boolean
  action?: 'create'
}

type GraphLinkData = RelationEdge & {
  source: number
  target: number
  strength: number
  color: string
  width: number
  peer?: boolean
}

type GraphNode = NodeObject<GraphNodeData>
type GraphLink = LinkObject<GraphNodeData, GraphLinkData>

const GRAPH_HEIGHT = 470

export function RelationForceMap({
  me,
  nodes,
  edges,
}: {
  me: RelationMapResponse['me']
  nodes: RelationMapResponse['nodes']
  edges: RelationMapResponse['edges']
}) {
  const navigate = useNavigate()
  const graphRef = useRef<
    ForceGraphMethods<GraphNodeData, GraphLinkData> | undefined
  >(undefined)
  const containerRef = useRef<HTMLDivElement>(null)
  const didInitialFitRef = useRef(false)
  const suppressClickUntilRef = useRef(0)
  const imageCacheRef = useRef(new Map<string, HTMLImageElement>())
  const [size, setSize] = useState({ width: 360, height: GRAPH_HEIGHT })
  const [hoveredNodeId, setHoveredNodeId] = useState<number | null>(null)

  const graphData = useMemo<GraphData<GraphNodeData, GraphLinkData>>(() => {
    const edgeByPerson = new Map(edges.map((edge) => [edge.personId, edge]))
    const graphNodes = nodes.map((node, index) => {
      const angle =
        (index / Math.max(nodes.length, 1)) * Math.PI * 2 - Math.PI / 2
      const daysSinceLastMeet = node.intimacy.daysSinceLastMeet ?? 45
      const distant = node.intimacy.status === 'DISTANT'
      const radius = 96 + Math.min(daysSinceLastMeet, 90) * 0.55

      return {
        ...node,
        val: node.favorite ? 18 : distant ? 9 : 13,
        distant,
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius,
      }
    })

    return {
      nodes: [
        {
          id: 0,
          name: me.label,
          profileImageUrl: null,
          favorite: false,
          relationTags: [],
          intimacy: {
            status: 'NORMAL',
            averageIntervalDays: null,
            daysSinceLastMeet: 0,
          },
          val: 26,
          distant: false,
          fx: 0,
          fy: 0,
        },
        ...graphNodes,
        {
          id: -1,
          name: '사람 추가',
          profileImageUrl: null,
          favorite: false,
          relationTags: [],
          intimacy: {
            status: 'UNKNOWN',
            averageIntervalDays: null,
            daysSinceLastMeet: null,
          },
          val: 12,
          distant: false,
          action: 'create',
          x: 150,
          y: 6,
        },
      ],
      links: [
        ...nodes.map((node) => {
          const edge = edgeByPerson.get(node.id)
          const distant = edge?.distant ?? node.intimacy.status === 'DISTANT'

          return {
            personId: node.id,
            distant,
            source: 0,
            target: node.id,
            strength: distant ? 0.45 : node.favorite ? 0.95 : 0.72,
            color: distant ? 'rgba(24, 24, 27, 0.3)' : 'rgba(24, 24, 27, 0.58)',
            width: distant ? 1.6 : node.favorite ? 3 : 2.25,
          }
        }),
        {
          personId: -1,
          distant: true,
          source: 0,
          target: -1,
          strength: 0.32,
          color: 'rgba(24, 24, 27, 0.34)',
          width: 1.5,
        },
        ...buildPeerLinks(nodes),
      ],
    }
  }, [edges, me.label, nodes])

  useEffect(() => {
    const element = containerRef.current

    if (!element) return

    const observer = new ResizeObserver(([entry]) => {
      setSize({
        width: Math.max(320, Math.floor(entry.contentRect.width)),
        height: GRAPH_HEIGHT,
      })
    })

    observer.observe(element)

    return () => observer.disconnect()
  }, [])

  useEffect(() => {
    const graph = graphRef.current

    if (!graph) return

    graph.d3Force('charge')?.strength?.(-155)
    graph
      .d3Force('link')
      ?.distance?.((link: GraphLink) => 86 + (1 - link.strength) * 80)
    graph.d3Force('center')?.strength?.(0.05)
    graph.zoom(1.05)
    graph.centerAt(0, 0)
  }, [size.width, graphData])

  useEffect(() => {
    const graph = graphRef.current

    if (!graph || didInitialFitRef.current) return

    didInitialFitRef.current = true
    window.setTimeout(() => graph.zoomToFit(420, 44), 150)
  }, [graphData])

  useEffect(() => {
    graphData.nodes.forEach((node) => {
      const src = mediaUrl(node.profileImageUrl)

      if (!src || imageCacheRef.current.has(src)) return

      const image = new Image()
      image.crossOrigin = 'anonymous'
      image.src = src
      image.onload = () => graphRef.current?.d3ReheatSimulation()
      imageCacheRef.current.set(src, image)
    })
  }, [graphData])

  return (
    <div ref={containerRef} className="relative mt-2 h-[470px] overflow-hidden">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(24,24,27,0.08),transparent_36%),radial-gradient(circle_at_22%_75%,rgba(24,24,27,0.045),transparent_24%)]" />
      <ForceGraph2D
        ref={graphRef}
        graphData={graphData}
        width={size.width}
        height={size.height}
        autoPauseRedraw={false}
        backgroundColor="rgba(255,255,255,0)"
        nodeId="id"
        nodeVal="val"
        nodeLabel={(node) => node.name}
        nodeCanvasObjectMode={() => 'replace'}
        nodeCanvasObject={(node, context, globalScale) =>
          drawRelationNode(
            node,
            context,
            globalScale,
            hoveredNodeId === node.id,
            imageCacheRef.current,
          )
        }
        nodePointerAreaPaint={(node, paintColor, context) => {
          context.fillStyle = paintColor
          context.beginPath()
          context.arc(
            node.x ?? 0,
            node.y ?? 0,
            node.id === 0 ? 38 : node.action === 'create' ? 35 : 30,
            0,
            Math.PI * 2,
          )
          context.fill()
        }}
        linkColor={(link) => link.color}
        linkWidth={(link) => link.width}
        linkLineDash={(link) => (link.distant || link.peer ? [4, 6] : null)}
        linkDirectionalParticles={(link) =>
          !link.peer && link.strength > 0.9 ? 1 : 0
        }
        linkDirectionalParticleWidth={2}
        linkDirectionalParticleSpeed={0.004}
        cooldownTicks={90}
        d3AlphaDecay={0.035}
        d3VelocityDecay={0.34}
        minZoom={0.8}
        maxZoom={2.3}
        enableNodeDrag
        enablePanInteraction
        enableZoomInteraction
        showPointerCursor={(object) =>
          Boolean(object && 'name' in object && object.id !== 0)
        }
        onNodeHover={(node) =>
          setHoveredNodeId(node?.id ? Number(node.id) : null)
        }
        onNodeDrag={() => {
          suppressClickUntilRef.current = Date.now() + 500
        }}
        onNodeDragEnd={() => {
          suppressClickUntilRef.current = Date.now() + 500
        }}
        onNodeClick={(node) => {
          if (Date.now() < suppressClickUntilRef.current) return
          if (!node.id) return

          if (node.action === 'create') {
            navigate({ to: '/people/new' })
            return
          }

          navigate({
            to: '/people/$personId/timeline',
            params: { personId: String(node.id) },
          })
        }}
      />
    </div>
  )
}

function buildPeerLinks(nodes: RelationNode[]): GraphLinkData[] {
  const links = new Map<string, GraphLinkData>()

  const addPeerLink = (source: number, target: number, strength: number) => {
    if (source === target) return

    const [from, to] = [source, target].sort((a, b) => a - b)
    const key = `${from}-${to}`

    if (links.has(key)) return

    links.set(key, {
      personId: to,
      distant: true,
      source: from,
      target: to,
      strength,
      color: 'rgba(24, 24, 27, 0.16)',
      width: 1,
      peer: true,
    })
  }

  nodes.forEach((node, index) => {
    const nextNode = nodes[(index + 1) % nodes.length]
    if (nodes.length > 2) {
      addPeerLink(node.id, nextNode.id, 0.28)
    }

    node.relationTags.forEach((tag) => {
      nodes
        .filter(
          (candidate) =>
            candidate.id !== node.id &&
            candidate.relationTags.some(
              (candidateTag) => candidateTag.id === tag.id,
            ),
        )
        .forEach((candidate) => addPeerLink(node.id, candidate.id, 0.42))
    })
  })

  return [...links.values()]
}

function drawRelationNode(
  node: GraphNode,
  context: CanvasRenderingContext2D,
  globalScale: number,
  isHovered: boolean,
  imageCache: Map<string, HTMLImageElement>,
) {
  const x = node.x ?? 0
  const y = node.y ?? 0
  const isMe = node.id === 0
  const isCreate = node.action === 'create'
  const radius = isMe ? 34 : node.favorite ? 28 : 24
  const opacity = node.distant ? 0.56 : 1

  context.save()
  context.globalAlpha = opacity

  context.beginPath()
  context.arc(x, y, radius + (isHovered ? 12 : 7), 0, Math.PI * 2)
  context.fillStyle = isMe ? 'rgba(24,24,27,0.13)' : 'rgba(24,24,27,0.08)'
  context.fill()

  context.beginPath()
  context.arc(x, y, radius + 4, 0, Math.PI * 2)
  context.fillStyle = '#ffffff'
  context.shadowColor = 'rgba(24, 24, 27, 0.18)'
  context.shadowBlur = isHovered ? 18 : 10
  context.shadowOffsetY = 6
  context.fill()
  context.shadowBlur = 0
  context.shadowOffsetY = 0

  context.beginPath()
  context.arc(x, y, radius + 2, 0, Math.PI * 2)
  context.strokeStyle =
    node.favorite || isMe ? '#18181b' : 'rgba(24,24,27,0.16)'
  context.lineWidth = node.favorite || isMe ? 2.4 : isCreate ? 2 : 1.4
  if (isCreate) {
    context.setLineDash([5, 5])
  }
  context.stroke()
  context.setLineDash([])

  context.save()
  context.beginPath()
  context.arc(x, y, radius, 0, Math.PI * 2)
  context.clip()

  if (isMe || isCreate) {
    context.fillStyle = isMe ? '#18181b' : '#ffffff'
    context.fillRect(x - radius, y - radius, radius * 2, radius * 2)
    context.fillStyle = isMe ? '#ffffff' : '#18181b'
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.font = `800 ${isMe ? 18 : 24}px ${getComputedStyle(document.body).fontFamily}`
    context.fillText(isCreate ? '+' : monogram(node.name), x, y + 0.5)
  } else {
    const src = mediaUrl(node.profileImageUrl)
    const image = src ? imageCache.get(src) : undefined

    if (image?.complete && image.naturalWidth > 0) {
      drawCoverImage(
        context,
        image,
        x - radius,
        y - radius,
        radius * 2,
        radius * 2,
      )
    } else {
      drawProfileFallback(context, node, x, y, radius)
    }
  }

  context.restore()

  if (node.favorite) {
    context.beginPath()
    context.arc(x + radius * 0.78, y - radius * 0.72, 8, 0, Math.PI * 2)
    context.fillStyle = '#18181b'
    context.fill()
    context.fillStyle = '#ffffff'
    context.font = `800 9px ${getComputedStyle(document.body).fontFamily}`
    context.textAlign = 'center'
    context.textBaseline = 'middle'
    context.fillText('★', x + radius * 0.78, y - radius * 0.72 + 0.5)
  }

  const labelFontSize = Math.max(10, 12 / globalScale)
  context.font = `800 ${labelFontSize}px ${getComputedStyle(document.body).fontFamily}`
  const labelWidth = context.measureText(node.name).width + 14
  const labelHeight = labelFontSize + 8
  const labelX = x - labelWidth / 2
  const labelY = y + radius + 9

  context.beginPath()
  drawRoundRect(context, labelX, labelY, labelWidth, labelHeight, 6)
  context.fillStyle = isHovered ? '#18181b' : 'rgba(255,255,255,0.86)'
  context.fill()

  context.fillStyle = isHovered ? '#ffffff' : '#71717a'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.fillText(node.name, x, labelY + labelHeight / 2 + 0.5)

  context.restore()
}

function drawProfileFallback(
  context: CanvasRenderingContext2D,
  node: GraphNode,
  x: number,
  y: number,
  radius: number,
) {
  context.fillStyle = '#fbfbfa'
  context.fillRect(x - radius, y - radius, radius * 2, radius * 2)

  context.fillStyle = '#18181b'
  context.textAlign = 'center'
  context.textBaseline = 'middle'
  context.font = `800 ${Math.max(14, radius * 0.78)}px ${getComputedStyle(document.body).fontFamily}`
  context.fillText(monogram(node.name), x, y + 0.5)
}

function drawCoverImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
) {
  const scale = Math.max(
    width / image.naturalWidth,
    height / image.naturalHeight,
  )
  const scaledWidth = image.naturalWidth * scale
  const scaledHeight = image.naturalHeight * scale

  context.drawImage(
    image,
    x + (width - scaledWidth) / 2,
    y + (height - scaledHeight) / 2,
    scaledWidth,
    scaledHeight,
  )
}

function monogram(name: string) {
  return name.trim().slice(0, 1) || '?'
}

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number,
) {
  context.moveTo(x + radius, y)
  context.lineTo(x + width - radius, y)
  context.quadraticCurveTo(x + width, y, x + width, y + radius)
  context.lineTo(x + width, y + height - radius)
  context.quadraticCurveTo(
    x + width,
    y + height,
    x + width - radius,
    y + height,
  )
  context.lineTo(x + radius, y + height)
  context.quadraticCurveTo(x, y + height, x, y + height - radius)
  context.lineTo(x, y + radius)
  context.quadraticCurveTo(x, y, x + radius, y)
}
