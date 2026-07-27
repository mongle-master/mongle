import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { useState } from 'react'
import { describe, expect, it, vi } from 'vitest'

import type { Emotion } from './emotions'
import { EmotionPicker } from './emotion-picker'

function Stateful({ onChange }: { onChange?: (value: Emotion) => void }) {
  const [value, setValue] = useState<Emotion | null>(null)
  return (
    <EmotionPicker
      value={value}
      onChange={(next) => {
        setValue(next)
        onChange?.(next)
      }}
    />
  )
}

describe('EmotionPicker', () => {
  it('shows all five emotion families with labels', () => {
    render(<EmotionPicker value={null} onChange={() => {}} />)
    expect(screen.getByRole('radiogroup', { name: '감정 선택' })).toBeInTheDocument()
    for (const label of ['고요', '따뜻', '사색', '맑음', '소중']) {
      expect(screen.getByRole('radio', { name: label })).toBeInTheDocument()
    }
  })

  it('marks selected emotion and reports change', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()
    render(<Stateful onChange={onChange} />)

    const warm = screen.getByRole('radio', { name: '따뜻' })
    expect(warm).toHaveAttribute('aria-checked', 'false')

    await user.click(warm)
    expect(onChange).toHaveBeenCalledWith('warm')
    expect(warm).toHaveAttribute('aria-checked', 'true')
  })
})
