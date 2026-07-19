import { cleanup, render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { DialogShell } from './dialog-shell'

describe('DialogShell 접근성', () => {
  beforeEach(() => {
    const root = document.createElement('div')
    root.id = 'stack-overlay-root'
    document.body.appendChild(root)
  })

  afterEach(() => {
    cleanup()
    document.getElementById('stack-overlay-root')?.remove()
  })

  it('Escape로 닫는다', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <DialogShell open onOpenChange={onOpenChange} labelledBy="title">
        <h2 id="title">제목</h2>
        <button type="button">확인</button>
      </DialogShell>,
    )

    await user.keyboard('{Escape}')

    expect(onOpenChange).toHaveBeenCalledWith(false)
  })

  it('closeDisabled면 Escape로 닫히지 않는다 (처리 중 이탈 방지)', async () => {
    const user = userEvent.setup()
    const onOpenChange = vi.fn()

    render(
      <DialogShell
        open
        closeDisabled
        onOpenChange={onOpenChange}
        labelledBy="title"
      >
        <h2 id="title">제목</h2>
      </DialogShell>,
    )

    await user.keyboard('{Escape}')

    expect(onOpenChange).not.toHaveBeenCalled()
  })

  it('열리면 다이얼로그로 초점이 옮겨간다', () => {
    render(
      <DialogShell open onOpenChange={() => {}} labelledBy="title">
        <h2 id="title">제목</h2>
        <button type="button">확인</button>
      </DialogShell>,
    )

    expect(screen.getByRole('dialog')).toHaveFocus()
  })
})
