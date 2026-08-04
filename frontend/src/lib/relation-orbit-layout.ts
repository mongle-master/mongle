// 관계 궤도 지도의 배치 계산. '나'를 중심으로 최근 만남 시기에 맞는 동심원
// 링 위에 인물을 놓는다 — 위치 자체가 최근성 정보라 범례가 필요 없다.
// 시안 A(docs/experiments/2026-07-29-ux-directions/A-relation-orbit.html)의
// 뷰박스·링 규격을 그대로 가져왔다.

export const ORBIT_VIEWBOX = { width: 390, height: 560 } as const
export const ORBIT_CENTER = { x: 195, y: 285 } as const

export type OrbitRing = {
  label: string
  radius: number
  /** 이 링에 속하는 '마지막 만남 경과일' 상한(포함). */
  maxDays: number
}

// 경계는 링 라벨의 의미에서 역산했다: 이번 달≈31일, 이번 계절≈92일, 올해≈365일.
// 만남 이력 없음(null)은 '그 이전' 링에서 옅게 쉬게 한다(숨기지 않는다).
// 반경은 시안 A(58/112/166/220)에서 축소했는데, 시안의 바깥 링은 390px 뷰박스
// 밖으로 넘어가 균등 각도 배치 시 노드가 가장자리에서 잘리기 때문이다.
// 노드 반경(아바타+이름 여백)을 감안해 가장자리 여유를 보장하는 값으로 정했다.
export const ORBIT_RINGS: readonly OrbitRing[] = [
  { label: '이번 달', radius: 50, maxDays: 31 },
  { label: '이번 계절', radius: 92, maxDays: 92 },
  { label: '올해', radius: 134, maxDays: 365 },
  { label: '그 이전', radius: 170, maxDays: Number.POSITIVE_INFINITY },
] as const

export const ORBIT_OUTER_RING_INDEX = ORBIT_RINGS.length - 1

export function orbitRingIndex(
  daysSinceLastMeet: number | null | undefined,
): number {
  if (daysSinceLastMeet == null || daysSinceLastMeet < 0) {
    return ORBIT_OUTER_RING_INDEX
  }
  for (let i = 0; i < ORBIT_RINGS.length; i += 1) {
    if (daysSinceLastMeet <= ORBIT_RINGS[i].maxDays) return i
  }
  return ORBIT_OUTER_RING_INDEX
}

/** 0도가 12시 방향, 시계 방향 증가. 시안 A의 polar()와 동일 좌표계. */
export function orbitPolar(radius: number, angleDeg: number) {
  const rad = ((angleDeg - 90) * Math.PI) / 180
  return {
    x: ORBIT_CENTER.x + radius * Math.cos(rad),
    y: ORBIT_CENTER.y + radius * Math.sin(rad),
  }
}

/** 링 위 점선 호(멀어진 관계 표시용). 각도 폭은 노드 좌우 ±spanDeg. */
export function orbitArcPath(
  radius: number,
  startAngleDeg: number,
  endAngleDeg: number,
) {
  const start = orbitPolar(radius, startAngleDeg)
  const end = orbitPolar(radius, endAngleDeg)
  const to = (p: { x: number; y: number }) =>
    `${p.x.toFixed(1)} ${p.y.toFixed(1)}`
  return `M ${to(start)} A ${radius} ${radius} 0 0 1 ${to(end)}`
}

export type OrbitNodeLayout = {
  personId: number
  ringIndex: number
  angleDeg: number
  /** 뷰박스 대비 % — 컨테이너가 뷰박스 종횡비를 유지하므로 SVG와 겹친다. */
  xPercent: number
  yPercent: number
}

/**
 * 인물을 링에 배정하고 같은 링 안에서 겹치지 않게 각도를 나눈다.
 * id 오름차순 정렬 후 균등 분포라 같은 입력은 항상 같은 배치가 나온다.
 * 링마다 시작각을 어긋나게 해 인접 링과 방사 방향으로 줄서지 않게 한다.
 */
export function layoutOrbitNodes(
  persons: Array<{
    id: number
    daysSinceLastMeet: number | null | undefined
  }>,
): OrbitNodeLayout[] {
  const byRing = ORBIT_RINGS.map(() => [] as typeof persons)
  for (const person of persons) {
    byRing[orbitRingIndex(person.daysSinceLastMeet)].push(person)
  }

  const layouts: OrbitNodeLayout[] = []
  byRing.forEach((ringPersons, ringIndex) => {
    const sorted = [...ringPersons].sort((a, b) => a.id - b.id)
    const step = 360 / Math.max(sorted.length, 1)
    // +18°는 링 라벨(12시 방향)과 첫 노드가 겹치지 않게 여는 오프셋.
    const startAngle = 18 + ringIndex * 23
    sorted.forEach((person, index) => {
      const angleDeg = (startAngle + index * step) % 360
      const position = orbitPolar(ORBIT_RINGS[ringIndex].radius, angleDeg)
      layouts.push({
        personId: person.id,
        ringIndex,
        angleDeg,
        xPercent: (position.x / ORBIT_VIEWBOX.width) * 100,
        yPercent: (position.y / ORBIT_VIEWBOX.height) * 100,
      })
    })
  })

  return layouts.sort((a, b) => a.personId - b.personId)
}

/** '마지막 만남' 표시. 시안 A의 lastText() 규칙. */
export function formatDaysSinceLastMeet(
  days: number | null | undefined,
): string {
  if (days == null) return '기록 없음'
  if (days <= 0) return '오늘'
  if (days <= 60) return `${days}일 전`
  if (days < 365) return `${Math.round(days / 30.4)}개월 전`
  return `약 ${Math.round(days / 365)}년 전`
}

/** '알고 지낸 시간' 표시. 처음 만난 날부터의 경과일을 사람 말로 줄인다. */
export function formatKnownDuration(days: number | null | undefined): string {
  if (days == null || days < 0) return '—'
  if (days < 90) return `${days + 1}일`
  if (days < 365) return `${Math.max(1, Math.round(days / 30.4))}개월`
  return `${Math.max(1, Math.round(days / 365))}년`
}
