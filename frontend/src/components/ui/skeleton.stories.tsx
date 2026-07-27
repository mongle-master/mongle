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

export const CardRow: Story = {
  render: () => (
    <div className="flex w-72 items-center gap-3">
      <Skeleton className="size-10 rounded-full" />
      <div className="flex-1 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  ),
}
