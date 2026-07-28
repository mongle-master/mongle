import { Separator } from '@/components/ui/separator'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Separator',
  component: Separator,
  tags: ['autodocs'],
} satisfies Meta<typeof Separator>

export default meta

type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: () => (
    <div className="flex w-full max-w-sm flex-col gap-3">
      <p className="text-sm">위 기록</p>
      <Separator />
      <p className="text-sm">아래 기록</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-10 items-center gap-3 text-sm">
      <span>2026년 7월 28일</span>
      <Separator orientation="vertical" />
      <span>함께한 사람 2</span>
    </div>
  ),
}
