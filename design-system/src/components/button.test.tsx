import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'

import { Button } from './button'

describe('Button', () => {
  it('renders accessible button with label', () => {
    render(<Button>기록 작성</Button>)
    expect(screen.getByRole('button', { name: '기록 작성' })).toBeInTheDocument()
  })

  it('fires click handler', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(<Button onClick={onClick}>저장</Button>)

    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(onClick).toHaveBeenCalledOnce()
  })

  it('does not fire when disabled', async () => {
    const user = userEvent.setup()
    const onClick = vi.fn()
    render(
      <Button disabled onClick={onClick}>
        저장
      </Button>,
    )

    await user.click(screen.getByRole('button', { name: '저장' }))
    expect(onClick).not.toHaveBeenCalled()
  })
})
