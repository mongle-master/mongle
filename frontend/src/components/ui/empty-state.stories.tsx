import { Plus } from 'lucide-react'
import { Button } from '@/components/ui/button'
import {
  EmptyState,
  EmptyStateAction,
  EmptyStateDescription,
  EmptyStateTitle,
} from '@/components/ui/empty-state'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/EmptyState',
  component: EmptyState,
  tags: ['autodocs'],
} satisfies Meta<typeof EmptyState>

export default meta

type Story = StoryObj<typeof meta>

// 설명 + 버튼만 있는 최소 구성 (타임라인 빈 화면)
export const DescriptionOnly: Story = {
  render: () => (
    <EmptyState className="w-80 py-12">
      <EmptyStateDescription>
        아직 함께한 기록이 없어요. 첫 순간을 새겨보세요.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button variant="outline">기록 작성</Button>
      </EmptyStateAction>
    </EmptyState>
  ),
}

// 아이콘 + 제목 + 설명 + 버튼 (사람 목록 빈 화면). 아이콘은 children으로 조합한다.
export const WithIconAndTitle: Story = {
  render: () => (
    <EmptyState className="w-80 py-12">
      <div className="mb-4 flex size-14 items-center justify-center rounded-full bg-muted text-2xl">
        👤
      </div>
      <EmptyStateTitle>아직 기록한 사람이 없어요</EmptyStateTitle>
      <EmptyStateDescription className="mt-2 max-w-[240px]">
        첫 사람을 추가하고 관계를 남겨보세요.
      </EmptyStateDescription>
      <EmptyStateAction>
        <Button size="cta">
          <Plus className="size-4" />
          사람 추가
        </Button>
      </EmptyStateAction>
    </EmptyState>
  ),
}
