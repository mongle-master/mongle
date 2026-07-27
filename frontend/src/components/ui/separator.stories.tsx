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
    <div className="w-64">
      <p className="text-sm">위 영역</p>
      <Separator className="my-3" />
      <p className="text-sm">아래 영역</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3">
      <span className="text-sm">왼쪽</span>
      <Separator orientation="vertical" />
      <span className="text-sm">오른쪽</span>
    </div>
  ),
}
