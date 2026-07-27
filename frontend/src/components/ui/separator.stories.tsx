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
    <div className="w-72">
      <p className="text-sm font-medium">관계 태그</p>
      <p className="text-label text-muted-foreground">
        소중한 친구 · 회사 동료
      </p>
      <Separator className="my-3" />
      <p className="text-sm font-medium">카테고리</p>
      <p className="text-label text-muted-foreground">만남 · 연락 · 기념일</p>
    </div>
  ),
}

export const Vertical: Story = {
  render: () => (
    <div className="flex h-6 items-center gap-3">
      <span className="text-sm">프로필</span>
      <Separator orientation="vertical" />
      <span className="text-sm">타임라인</span>
    </div>
  ),
}
