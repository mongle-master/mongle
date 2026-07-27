import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { DiaryEntryCard } from './diary-entry-card'

describe('DiaryEntryCard', () => {
  it('renders date, title, preview, emotion label and people', () => {
    render(
      <DiaryEntryCard
        date="2026년 7월 27일 · 월"
        title="서연이와 한강 산책"
        bodyPreview="퇴근하고 한강에서 만났다."
        emotion="warm"
        people={['김서연']}
      />,
    )

    expect(screen.getByText('2026년 7월 27일 · 월')).toBeInTheDocument()
    expect(screen.getByRole('heading', { name: '서연이와 한강 산책' })).toBeInTheDocument()
    expect(screen.getByText('퇴근하고 한강에서 만났다.')).toBeInTheDocument()
    // 감정 배지는 색 점이 아니라 라벨로 읽혀야 한다
    expect(screen.getByText('따뜻')).toBeInTheDocument()
    expect(screen.getByText('김서연')).toBeInTheDocument()
  })

  it('omits people section when empty', () => {
    render(
      <DiaryEntryCard date="2026년 7월 26일" title="혼자 간 서점" bodyPreview="조용한 오후" />,
    )
    expect(screen.queryByText('김서연')).not.toBeInTheDocument()
  })
})
