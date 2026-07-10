import { describe, expect, it } from 'vitest'
import {
  buildPersonActivityFlow,
  matchesActivityFlowSelection,
} from '@/lib/timeline-activity-flow'

describe('buildPersonActivityFlow', () => {
  it('shows every month label in the 1 year period even when a month has no records', () => {
    const flow = buildPersonActivityFlow(
      [{ id: 1, name: '민수' }],
      [
        { id: '1', date: '2026-03-17', personId: 1 },
        { id: '2', date: '2026-05-03', personId: 1 },
        { id: '3', date: '2026-06-08', personId: 1 },
        { id: '4', date: '2026-07-01', personId: 1 },
      ],
      '1Y',
      new Date(2026, 6, 8),
    )

    expect(flow?.axisLabels.map((label) => label.text)).toEqual([
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
    ])
    expect(flow?.axisLabels.map((label) => label.position)).toEqual([
      0,
      1 / 6,
      2 / 6,
      3 / 6,
      4 / 6,
      5 / 6,
      1,
    ])
    expect(flow?.lanes).toHaveLength(1)
    expect(flow?.lanes[0]?.points).toHaveLength(4)
  })

  it('renders one lane per registered person', () => {
    const flow = buildPersonActivityFlow(
      [
        { id: 1, name: '민수' },
        { id: 2, name: '지영' },
      ],
      [
        { id: 'a', date: '2026-03-17', personId: 1 },
        { id: 'b', date: '2026-05-03', personId: 2 },
      ],
      '1Y',
      new Date(2026, 6, 8),
    )

    expect(flow?.lanes.map((lane) => lane.label)).toEqual(['민수', '지영'])
    expect(flow?.lanes[0]?.points).toHaveLength(1)
    expect(flow?.lanes[1]?.points).toHaveLength(1)
  })

  it('RECENT trims leading empty months to the first month with a record', () => {
    const flow = buildPersonActivityFlow(
      [{ id: 1, name: '민수' }],
      [
        { id: '1', date: '2026-03-17', personId: 1 },
        { id: '2', date: '2026-05-03', personId: 1 },
      ],
      'RECENT',
      new Date(2026, 6, 8),
    )

    expect(flow?.axisLabels.map((label) => label.text)).toEqual([
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
    ])
  })

  it('RECENT falls back to the full year when there is no record this year', () => {
    const flow = buildPersonActivityFlow(
      [{ id: 1, name: '민수' }],
      [],
      'RECENT',
      new Date(2026, 6, 8),
    )

    expect(flow?.axisLabels.map((label) => label.text)).toEqual([
      '1월',
      '2월',
      '3월',
      '4월',
      '5월',
      '6월',
      '7월',
    ])
    expect(flow?.quietMessage).toBe('올해는 아직 기록이 없어요')
  })

  it('shrinks dot size as person count or per-lane meeting frequency grows', () => {
    const manyPersons = Array.from({ length: 9 }, (_, i) => ({
      id: i + 1,
      name: `사람${i + 1}`,
    }))
    const flowCrowded = buildPersonActivityFlow(
      manyPersons,
      [{ id: '1', date: '2026-03-17', personId: 1 }],
      '1Y',
      new Date(2026, 6, 8),
    )
    expect(flowCrowded?.dotSize).toBe('sm')

    const flowFew = buildPersonActivityFlow(
      [{ id: 1, name: '민수' }],
      [{ id: '1', date: '2026-03-17', personId: 1 }],
      '1Y',
      new Date(2026, 6, 8),
    )
    expect(flowFew?.dotSize).toBe('lg')
  })

  it('carries the first photo of a record onto its point', () => {
    const flow = buildPersonActivityFlow(
      [{ id: 1, name: '민수' }],
      [
        {
          id: '1',
          date: '2026-03-17',
          personId: 1,
          photoUrl: '/images/a.jpg',
        },
      ],
      '1Y',
      new Date(2026, 6, 8),
    )

    expect(flow?.lanes[0]?.points[0]?.photoUrl).toBe('/images/a.jpg')
  })

  it('filters by person and exact date, not month only', () => {
    const selection = { personId: 1, date: '2026-03-17' }

    expect(matchesActivityFlowSelection('2026-03-17', [1, 2], selection)).toBe(
      true,
    )
    expect(matchesActivityFlowSelection('2026-03-17', [2], selection)).toBe(
      false,
    )
    expect(matchesActivityFlowSelection('2026-05-03', [1], selection)).toBe(
      false,
    )
    expect(matchesActivityFlowSelection('2026-03-17', [1], null)).toBe(true)
  })
})
