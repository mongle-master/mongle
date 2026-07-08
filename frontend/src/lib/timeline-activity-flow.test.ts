import { describe, expect, it } from 'vitest'
import { buildRecordActivityFlow } from '@/lib/timeline-activity-flow'

describe('buildRecordActivityFlow', () => {
  it('shows every month label in the 1 year period even when a month has no records', () => {
    const flow = buildRecordActivityFlow(
      ['2026-03-17', '2026-05-03', '2026-06-08', '2026-07-01'],
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
  })
})
