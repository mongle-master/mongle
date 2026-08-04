import { describe, expect, it } from 'vitest'
import {
  ORBIT_CENTER,
  ORBIT_RINGS,
  ORBIT_VIEWBOX,
  formatDaysSinceLastMeet,
  formatKnownDuration,
  layoutOrbitNodes,
  orbitArcPath,
  orbitRingIndex,
} from './relation-orbit-layout'

describe('orbitRingIndex', () => {
  it('경계값에서 링 라벨의 의미대로 배정한다', () => {
    expect(orbitRingIndex(0)).toBe(0)
    expect(orbitRingIndex(31)).toBe(0)
    expect(orbitRingIndex(32)).toBe(1)
    expect(orbitRingIndex(92)).toBe(1)
    expect(orbitRingIndex(93)).toBe(2)
    expect(orbitRingIndex(365)).toBe(2)
    expect(orbitRingIndex(366)).toBe(3)
  })

  it('만남 이력이 없거나 유효하지 않으면 그 이전 링에 둔다', () => {
    expect(orbitRingIndex(null)).toBe(3)
    expect(orbitRingIndex(undefined)).toBe(3)
    expect(orbitRingIndex(-3)).toBe(3)
  })
})

describe('layoutOrbitNodes', () => {
  it('같은 링의 인물을 겹치지 않게 균등 각도로 배치한다', () => {
    const layouts = layoutOrbitNodes([
      { id: 1, daysSinceLastMeet: 3 },
      { id: 2, daysSinceLastMeet: 6 },
      { id: 3, daysSinceLastMeet: 11 },
    ])

    expect(layouts).toHaveLength(3)
    const angles = layouts.map((l) => l.angleDeg).sort((a, b) => a - b)
    expect(angles[1] - angles[0]).toBeCloseTo(120, 5)
    expect(angles[2] - angles[1]).toBeCloseTo(120, 5)
  })

  it('같은 입력은 항상 같은 배치를 반환한다', () => {
    const persons = [
      { id: 7, daysSinceLastMeet: 41 },
      { id: 2, daysSinceLastMeet: null },
      { id: 9, daysSinceLastMeet: 400 },
      { id: 4, daysSinceLastMeet: 100 },
    ]
    expect(layoutOrbitNodes(persons)).toEqual(layoutOrbitNodes(persons))
  })

  it('좌표는 뷰박스 안이고 링 위에 있다', () => {
    const layouts = layoutOrbitNodes([
      { id: 1, daysSinceLastMeet: 0 },
      { id: 2, daysSinceLastMeet: 400 },
    ])

    for (const layout of layouts) {
      const x = (layout.xPercent / 100) * ORBIT_VIEWBOX.width
      const y = (layout.yPercent / 100) * ORBIT_VIEWBOX.height
      const distance = Math.hypot(x - ORBIT_CENTER.x, y - ORBIT_CENTER.y)
      expect(distance).toBeCloseTo(ORBIT_RINGS[layout.ringIndex].radius, 5)
      expect(x).toBeGreaterThan(0)
      expect(x).toBeLessThan(ORBIT_VIEWBOX.width)
      expect(y).toBeGreaterThan(0)
      expect(y).toBeLessThan(ORBIT_VIEWBOX.height)
    }
  })

  it('입력이 없으면 빈 배열을 반환한다', () => {
    expect(layoutOrbitNodes([])).toEqual([])
  })
})

describe('orbitArcPath', () => {
  it('12시 방향 기준의 원호 경로를 만든다', () => {
    // 반지름 100, -16도~+16도(12시 중심)이면 시작점은 왼쪽 위, 끝점은 오른쪽 위.
    const path = orbitArcPath(100, -16, 16)
    expect(path).toMatch(/^M [\d.]+ [\d.]+ A 100 100 0 0 1 [\d.]+ [\d.]+$/)
    const [start, end] = path
      .replace(/^M /, '')
      .split(' A 100 100 0 0 1 ')
      .map((point) => point.split(' ').map(Number))
    expect(start[0]).toBeLessThan(ORBIT_CENTER.x)
    expect(end[0]).toBeGreaterThan(ORBIT_CENTER.x)
    expect(start[1]).toBeLessThan(ORBIT_CENTER.y)
    expect(end[1]).toBeLessThan(ORBIT_CENTER.y)
  })
})

describe('formatDaysSinceLastMeet', () => {
  it('시안 규칙대로 포맷한다', () => {
    expect(formatDaysSinceLastMeet(null)).toBe('기록 없음')
    expect(formatDaysSinceLastMeet(0)).toBe('오늘')
    expect(formatDaysSinceLastMeet(3)).toBe('3일 전')
    expect(formatDaysSinceLastMeet(60)).toBe('60일 전')
    expect(formatDaysSinceLastMeet(92)).toBe('3개월 전')
    expect(formatDaysSinceLastMeet(398)).toBe('약 1년 전')
  })
})

describe('formatKnownDuration', () => {
  it('알고 지낸 시간을 일/개월/년으로 줄인다', () => {
    expect(formatKnownDuration(null)).toBe('—')
    expect(formatKnownDuration(0)).toBe('1일')
    expect(formatKnownDuration(45)).toBe('46일')
    expect(formatKnownDuration(364)).toBe('12개월')
    expect(formatKnownDuration(365 * 3 + 30)).toBe('3년')
  })
})
