import { useEffect, useState } from 'react'
import type { ReactNode } from 'react'
import { Button } from '@/components/ui/button'
import { DialogShell } from '@/components/ui/dialog-shell'
import type { Meta, StoryObj } from '@storybook/react-vite'

// DialogShell은 document.getElementById('stack-overlay-root')로 포탈한다.
// 대상 엘리먼트가 없으면 첫 렌더에서 null을 반환하고 다시 그리지 않으므로,
// 셸이 렌더되기 전에 root가 DOM에 존재하도록 보장한 뒤에만 children을 그린다.
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

const demoBody = (
  <>
    <div className="pr-9">
      <h2
        id="dialog-shell-demo-title"
        className="text-base font-extrabold tracking-tight text-foreground"
      >
        다이얼로그 제목
      </h2>
      <p className="mt-2 text-sm font-medium leading-relaxed text-muted-foreground">
        DialogShell은 포탈·백드롭·전환·닫기 버튼만 제공하고, 제목·본문·푸터는
        children으로 받는다.
      </p>
    </div>
    <div className="mt-5 flex justify-end">
      <Button size="cta">확인</Button>
    </div>
  </>
)

const meta = {
  title: 'UI/DialogShell',
  component: DialogShell,
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
    labelledBy: 'dialog-shell-demo-title',
    onOpenChange: () => {},
    children: demoBody,
  },
} satisfies Meta<typeof DialogShell>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Interactive: Story = {
  render: (args) => {
    const [open, setOpen] = useState(false)
    return (
      <>
        <Button onClick={() => setOpen(true)}>열기</Button>
        <DialogShell {...args} open={open} onOpenChange={setOpen} />
      </>
    )
  },
}
