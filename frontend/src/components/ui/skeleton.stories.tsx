import { Skeleton } from '@/components/ui/skeleton'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Skeleton',
  component: Skeleton,
  tags: ['autodocs'],
} satisfies Meta<typeof Skeleton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { className: 'h-4 w-40' },
}

export const Circle: Story = {
  args: { className: 'size-12 rounded-full' },
}

export const PersonCard: Story = {
  render: () => (
    <div className="flex w-72 items-center gap-3 rounded-xl border border-border bg-card p-4">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-24" />
        <Skeleton className="h-3 w-16" />
      </div>
      <Skeleton className="h-3 w-10" />
    </div>
  ),
}

export const DiaryEntry: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3 rounded-xl border border-border bg-card p-5">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-44" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-2/3" />
    </div>
  ),
}
