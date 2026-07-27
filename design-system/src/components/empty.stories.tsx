import type { Meta, StoryObj } from '@storybook/react-vite'
import { BookHeart } from 'lucide-react'

import { Button } from './button'
import { Empty } from './empty'

const meta = {
  title: 'Core/Empty',
  component: Empty,
} satisfies Meta<typeof Empty>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { title: '아직 기록이 없어요' },
  render: () => (
    <Empty
      icon={<BookHeart className="size-10" strokeWidth={1.5} />}
      title="아직 기록이 없어요"
      description="오늘 만난 사람과의 순간을 처음으로 남겨보세요."
      action={<Button>첫 기록 작성</Button>}
    />
  ),
}
