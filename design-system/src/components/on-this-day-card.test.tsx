import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { OnThisDayCard } from './on-this-day-card'

describe('OnThisDayCard', () => {
  it('shows the retrospective label, quote and emotion label', () => {
    render(
      <OnThisDayCard
        originalDate="2025년 7월 27일"
        quote="첫 출근 날. 설렜다."
        emotion="warm"
      />,
    )

    expect(screen.getByText(/1년 전 오늘/)).toBeInTheDocument()
    expect(screen.getByText(/첫 출근 날\. 설렜다\./)).toBeInTheDocument()
    expect(screen.getByText(/따뜻/)).toBeInTheDocument()
  })
})
