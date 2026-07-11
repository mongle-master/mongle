import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { TimeWheel } from './date-time-wheel'

describe('TimeWheel', () => {
  afterEach(cleanup)

  it('clears the time when time is unknown', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TimeWheel value="14:30" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '시간 모름' }))

    expect(onChange).toHaveBeenCalledWith('')
  })

  it('starts time input from the current five-minute unit', async () => {
    const user = userEvent.setup()
    const onChange = vi.fn()

    render(<TimeWheel value="" onChange={onChange} />)

    await user.click(screen.getByRole('button', { name: '시간 입력' }))

    expect(onChange).toHaveBeenCalledWith(
      expect.stringMatching(/^([01]\d|2[0-3]):[0-5][05]$/),
    )
  })
})
