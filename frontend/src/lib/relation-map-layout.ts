type LayoutInput = { id: number; recordCount?: number; bonded?: boolean }

type MapPoint = { x: number; y: number }

/** id 기반 시드 — 같은 인물은 항상 같은 자리(결정적이지만 대칭은 깨짐). */
function seeded01(id: number, salt: number) {
  const x = Math.sin(id * 12.9898 + salt * 78.233) * 43758.5453
  return x - Math.floor(x)
}

const GOLDEN_ANGLE = Math.PI * (3 - Math.sqrt(5))
const MIN_GAP = 11.5
/**
 * 사이가 있을 때만 쓰는 넓은 간격.
 * 기본값 11.5 는 좌표계 100 기준이라 폭 420px 화면에서 약 48px인데, 노드 지름이 56px이라 서로 겹칠 수 있다.
 * 겹치면 두 사람을 잇는 선이 노드 밑에 완전히 깔려 **보이지도 눌리지도 않는다** — 이은 것이 사라진 것처럼 보인다.
 * 그래서 사이를 그려야 할 때는 노드 지름보다 확실히 넓게 벌려 선이 드러날 여백을 만든다.
 * (사이가 없으면 예전 간격 그대로 — 기존 배치를 바꾸지 않는다.)
 */
const MIN_GAP_BONDED = 19
// 두 겹 배치의 반경. 완화(relax)가 간격만큼 밀어내므로 두 띠가 겹치지 않게 사이를 벌려 둔다.
const INNER_BASE_RADIUS = 17
const OUTER_BASE_RADIUS = 35

function distance(a: MapPoint, b: MapPoint) {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

function clampPoint(p: MapPoint): MapPoint {
  return {
    x: Math.min(88, Math.max(12, p.x)),
    y: Math.min(82, Math.max(18, p.y)),
  }
}

function relax(points: MapPoint[], pinnedIndex?: number, minGap = MIN_GAP) {
  const next = points.map((p) => ({ ...p }))
  for (let iter = 0; iter < 8; iter++) {
    for (let i = 0; i < next.length; i++) {
      for (let j = i + 1; j < next.length; j++) {
        const dx = next[j].x - next[i].x
        const dy = next[j].y - next[i].y
        const dist = Math.hypot(dx, dy) || 0.001
        if (dist >= minGap) continue
        const push = (minGap - dist) / 2
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
 *
 * bonded 가 하나라도 있으면 반경을 두 겹으로 나눈다 — 사이가 있는 사람은 안쪽에 모이고,
 * 아무와도 이어지지 않은 사람은 바깥 링에 남는다(PRD 01 §11.4).
 * 사이가 아예 없으면(사용자가 아직 하나도 잇지 않은 흔한 상태) 예전 배치를 그대로 쓴다 —
 * 그러지 않으면 전원이 "연결 없음"이라 다 같이 바깥으로 밀려나 링 하나만 남는다.
 */
export function layoutOrganicRelationMap(
  nodes: LayoutInput[],
  cx = 50,
  cy = 52,
): { persons: MapPoint[]; add: MapPoint } {
  const layered = nodes.some((node) => node.bonded)
  const persons = nodes.map((node, i) => {
    const angleJitter = (seeded01(node.id, 1) - 0.5) * 1.1
    const angle = i * GOLDEN_ANGLE + angleJitter - Math.PI / 2
    const recordBoost = node.recordCount
      ? Math.min(8, Math.sqrt(node.recordCount) * 2.2)
      : seeded01(node.id, 2) * 5
    const spread = seeded01(node.id, 3)
    const radius = !layered
      ? 24 + spread * 16 + recordBoost
      : node.bonded
        ? INNER_BASE_RADIUS + spread * 9 + Math.min(recordBoost, 5)
        : OUTER_BASE_RADIUS + spread * 9
    const ySquash = 0.86 + seeded01(node.id, 4) * 0.12
    return clampPoint({
      x: cx + radius * Math.cos(angle),
      y: cy + radius * Math.sin(angle) * ySquash,
    })
  })

  const minGap = layered ? MIN_GAP_BONDED : MIN_GAP
  const relaxed = relax(persons, undefined, minGap)
  const add = placeAddButton(relaxed, cx, cy)
  const withAdd = relax([...relaxed, add], undefined, minGap)

  return {
    persons: withAdd.slice(0, nodes.length),
    add: withAdd[nodes.length] ?? add,
  }
}

export function burstDelay(point: MapPoint, center: MapPoint, index: number) {
  const dist = distance(point, center)
  return 0.05 + index * 0.035 + dist * 0.004
}
