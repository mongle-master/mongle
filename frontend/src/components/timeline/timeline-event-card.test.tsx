import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TimelineEventCard } from './timeline-event-card'
import type { TimelineEventCardItem } from './timeline-event-card'

const item: TimelineEventCardItem = {
  id: 1,
  title: '비밀 회동',
  memo: '민감한 메모 내용',
  occurredDate: '2026-07-01',
  category: { id: 10, label: '나만의 모임' },
  persons: [
    { id: 3, name: '김몽글', profileImageUrl: undefined, favorite: false },
  ],
  emotions: [{ id: 20, label: '나만의 감정' }],
}

function expectMasked(text: string) {
  expect(screen.getByText(text).closest('[data-amp-mask]')).not.toBeNull()
}

describe('TimelineEventCard Amplitude 마스킹', () => {
  afterEach(cleanup)

  it('제목·메모·카테고리·감정·사람 라벨이 모두 data-amp-mask 아래에 렌더된다', () => {
    render(<TimelineEventCard item={item} onSelect={vi.fn()} />)

    expectMasked('비밀 회동')
    expectMasked('민감한 메모 내용')
    expectMasked('나만의 모임')
    expectMasked('나만의 감정')
    expectMasked('김몽글')
  })
})

describe('TimelineEventCard 선택 콜백', () => {
  afterEach(cleanup)

  it('카드를 누르면 onSelect가 기록 id로 호출된다', () => {
    const onSelect = vi.fn()
    render(<TimelineEventCard item={item} onSelect={onSelect} />)

    fireEvent.click(screen.getByRole('button'))

    expect(onSelect).toHaveBeenCalledWith(item.id)
  })
})
