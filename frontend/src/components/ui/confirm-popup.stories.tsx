import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { ConfirmPopup } from '@/components/ui/confirm-popup'
import type { Meta, StoryObj } from '@storybook/react-vite'

// ConfirmPopup은 document.getElementById('stack-overlay-root')로 포탈한다.
// 대상 엘리먼트가 없으면 첫 렌더에서 null을 반환하고 다시 그리지 않으므로,
// 팝업이 렌더되기 전에 root가 DOM에 존재하도록 보장한 뒤에만 children을 그린다.
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
  title: 'UI/ConfirmPopup',
  component: ConfirmPopup,
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
    title: '변경사항을 저장할까요?',
    description: '지금 나가면 작성 중인 내용이 사라져요.',
    onOpenChange: () => {},
    onConfirm: () => {},
  },
} satisfies Meta<typeof ConfirmPopup>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Destructive: Story = {
  args: {
    destructive: true,
    title: '기록을 삭제할까요?',
    description: '삭제하면 되돌릴 수 없어요.',
    confirmLabel: '삭제',
  },
}

export const Pending: Story = {
  args: {
    pending: true,
    title: '기록을 삭제할까요?',
    description: '삭제하면 되돌릴 수 없어요.',
    confirmLabel: '삭제',
    destructive: true,
  },
}

export const WithError: Story = {
  args: {
    title: '기록을 삭제할까요?',
    description: '삭제하면 되돌릴 수 없어요.',
    error: '삭제하지 못했어요. 잠시 후 다시 시도해 주세요.',
    confirmLabel: '삭제',
    destructive: true,
  },
}

export const LongDescription: Story = {
  args: {
    title: '이 사람을 삭제할까요?',
    description:
      '엄마와 연결된 모든 기록과 태그가 함께 삭제돼요.\n삭제한 뒤에는 되돌릴 수 없고, 타임라인에서도 더 이상 보이지 않아요.\n정말 삭제하려면 아래 삭제 버튼을 눌러주세요.',
    confirmLabel: '삭제',
    destructive: true,
  },
}
