import { cleanup, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it } from 'vitest'
import {
  TimelineCategoryFilters,
  TimelinePersonFilters,
} from './timeline-filters'
import type {
  ChipResponse,
  PersonResponse,
} from '@/apis/generated/mongle-api.schemas'

function chip(overrides: Partial<ChipResponse>): ChipResponse {
  return {
    id: 1,
    type: 'CATEGORY',
    label: '식사',
    color: null,
    personal: false,
    order: 0,
    default: false,
    ...overrides,
  }
}

describe('TimelineCategoryFilters Amplitude 마스킹', () => {
  afterEach(cleanup)

  it('개인 칩만 마스킹하고 공통 칩 라벨은 남긴다', () => {
    render(
      <TimelineCategoryFilters
        chips={[
          chip({ id: 1, label: '식사', personal: false }),
          chip({ id: 2, label: '나만의 모임', personal: true }),
        ]}
        selectedIds={[]}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByText('식사').closest('[data-amp-mask]')).toBeNull()
    expect(
      screen.getByText('나만의 모임').closest('[data-amp-mask]'),
    ).not.toBeNull()
  })
})

describe('TimelinePersonFilters Amplitude 마스킹', () => {
  afterEach(cleanup)

  it('사람 이름이 data-amp-mask 아래에 렌더된다', () => {
    const person = {
      id: 3,
      name: '김몽글',
      relationTags: [],
      favorite: false,
      likes: [],
      cautions: [],
    } as unknown as PersonResponse

    render(
      <TimelinePersonFilters
        persons={[person]}
        selectedIds={[]}
        onToggle={() => {}}
      />,
    )

    expect(screen.getByText('김몽글').closest('[data-amp-mask]')).not.toBeNull()
  })
})
