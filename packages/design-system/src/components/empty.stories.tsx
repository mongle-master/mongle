import { Empty, EmptyIcon, EmptyTitle, EmptyDescription } from './empty'
import { Button } from './button'
import { BookOpen } from 'lucide-react'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Empty',
  component: Empty,
  tags: ['autodocs'],
} satisfies Meta<typeof Empty>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Empty>
      <EmptyIcon>
        <BookOpen />
      </EmptyIcon>
      <EmptyTitle>아직 기록이 없어요</EmptyTitle>
      <EmptyDescription>
        첫 일기를 작성하고 오늘의 감정을 남겨보세요.
      </EmptyDescription>
      <Button size="cta">첫 기록 작성</Button>
    </Empty>
  ),
}
