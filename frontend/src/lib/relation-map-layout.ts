type LayoutInput = { id: number; recordCount?: number }

type MapPoint = { x: number; y: number }

/** id 기반 시드 — 같은 인물은 항상 같은 자리(결정적이지만 대칭은 깨짐). */
function seeded01(id: number, salt: number) {
  const x = Math.sin(id * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const MIN_GAP = 11.5

function distance(a: MapPoint, b: MapPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function clampPoint(p: MapPoint): MapPoint {
  return {
    x: Math.min(88, Math.max(12, p.x)),
    y: Math.min(82, Math.max(18, p.y)),
  }
}

function relax(points: MapPoint[], pinnedIndex?: number) {
  const next = points.map((p) => ({ ...p }))
  for (let iter = 0; iter < 8; iter++) {
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        const dx = next[j].x - next[i].x
        const dy = next[j].y - next[i].y
        const dist = Math.hypot(dx, dy) || 0.001
        if (dist >= MIN_GAP) continue
        const push = (MIN_GAP - dist) / 2
        const nx = dx / dist
        const ny = dy / dist
        if (pinnedIndex !== j) {
          next[j].x += nx * push
          next[j].y += ny * push
        }
        if (pinnedIndex !== i) {
          next[i].x -= nx * push
          next[i].y -= ny * push
        }
      }
    }
    for (let i = 0; i < next.length; i++) {
      if (i === pinnedIndex) continue
      next[i] = clampPoint(next[i])
    }
  }
  return next
}

function placeAddButton(persons: MapPoint[], cx: number, cy: number): MapPoint {
  const candidates = Array.from({ length: 16 }, (_, i) => {
    const angle = (2 * Math.PI * i) / 16 + seeded01(999, i) * 0.35
    const radius = 30 + seeded01(1000, i) * 12
    return clampPoint({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle) * 0.9,
    })
  })

  let best = candidates[0]
  let bestScore = -Infinity
  for (const c of candidates) {
    const minDist = persons.reduce(
      (min, p) => Math.min(min, distance(c, p)),
      Infinity,
    )
    const score =
      minDist + seeded01(Math.round(c.x * 100), Math.round(c.y * 100)) * 2
    if (score > bestScore) {
      bestScore = score
      best = c
    }
  }
  return best
}

/**
 * Obsidian 그래프처럼 고정 원이 아니라 황금각 + 시드 지터 + 완화로 퍼뜨린다.
 * recordCount 가 많을수록 중심에서 조금 더 멀리(관계 밀도 느낌).
 */
export function layoutOrganicRelationMap(
  nodes: LayoutInput[],
  cx = 50,
  cy = 52,
): { persons: MapPoint[]; add: MapPoint } {
  const persons = nodes.map((node, i) => {
    const angleJitter = (seeded01(node.id, 1) - 0.5) * 1.1
    const angle = i * GOLDEN_ANGLE + angleJitter - Math.PI / 2
    const recordBoost = node.recordCount
      ? Math.min(8, Math.sqrt(node.recordCount) * 2.2)
      : seeded01(node.id, 2) * 5
    const radius = 24 + seeded01(node.id, 3) * 16 + recordBoost
    const ySquash = 0.86 + seeded01(node.id, 4) * 0.12
    return clampPoint({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle) * ySquash,
    })
  })

  const relaxed = relax(persons)
  const add = placeAddButton(relaxed, cx, cy)
  const withAdd = relax([...relaxed, add])

  return {
    persons: withAdd.slice(0, nodes.length),
    add: withAdd[nodes.length] ?? add,
  }
}

export function burstDelay(point: MapPoint, center: MapPoint, index: number) {
  const dist = distance(point, center)
  return 0.05 + index * 0.035 + dist * 0.004
}
