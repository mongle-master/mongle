import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'

import { GratitudeList } from './gratitude-list'

describe('GratitudeList', () => {
  it('renders an ordered list with all items', () => {
    render(
      <GratitudeList
        items={['해를 본 것', '안부를 받은 것', '공기가 선선했던 것']}
        aria-label="감사 목록"
      />,
    )

    const list = screen.getByRole('list', { name: '감사 목록' })
    expect(list.querySelectorAll('li')).toHaveLength(3)
    expect(screen.getByText('안부를 받은 것')).toBeInTheDocument()
  })
})
