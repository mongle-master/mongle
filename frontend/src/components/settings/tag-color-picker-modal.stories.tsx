import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { TagColorPickerModal } from '@/components/settings/tag-color-picker-modal'
import { RELATION_TAG_COLOR_OPTIONS } from '@/lib/relation-tag-colors'
import type { Meta, StoryObj } from '@storybook/react-vite'

// TagColorPickerModal은 DialogShell을 통해 #stack-overlay-root로 포탈한다.
// 대상 엘리먼트가 없으면 첫 렌더에서 null을 반환하므로, 렌더 전에 root를 주입한다.
// (confirm-popup, dialog-shell 스토리와 동일 패턴 — 공통 데코레이터로 추출 여지 있음)
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

  return <div style={{ minHeight: 420 }}>{ready ? children : null}</div>
}

const meta = {
  title: 'Settings/TagColorPickerModal',
  component: TagColorPickerModal,
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
    value: RELATION_TAG_COLOR_OPTIONS[0].value,
    onOpenChange: () => {},
    onChange: () => {},
  },
} satisfies Meta<typeof TagColorPickerModal>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
