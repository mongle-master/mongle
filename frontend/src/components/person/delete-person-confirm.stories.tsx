import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { DeletePersonConfirm } from '@/components/person/delete-person-confirm'
import type { Meta, StoryObj } from '@storybook/react-vite'

// DeletePersonConfirm은 ConfirmPopup(→DialogShell)을 통해 #stack-overlay-root로 포탈한다.
// 대상 엘리먼트가 없으면 첫 렌더에서 null을 반환하므로, 렌더 전에 root를 주입한다.
function StackOverlayDecorator({ children }: { children: ReactNode }) {
  const [ready, setReady] = useState(false)

  useEffect(() => {
    const existing = document.getElementById('stack-overlay-root')
    if (existing) {
      setReady(true)
      return
    }
    const root = document.createElement('div')
    root.id = 'stack-overlay-root'
    root.style.position = 'fixed'
    root.style.inset = '0'
    root.style.pointerEvents = 'none'
    document.body.appendChild(root)
    setReady(true)
    return () => {
      root.remove()
    }
  }, [])

  return <div style={{ minHeight: 320 }}>{ready ? children : null}</div>
}

const meta = {
  title: 'Person/DeletePersonConfirm',
  component: DeletePersonConfirm,
  tags: ['autodocs'],
  decorators: [
    (Story) => (
      <StackOverlayDecorator>
        <Story />
      </StackOverlayDecorator>
    ),
  ],
  args: {
    open: true,
    error: false,
    pending: false,
    onOpenChange: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof DeletePersonConfirm>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pending: Story = {
  args: { pending: true },
}

export const WithError: Story = {
  args: { error: true },
}
