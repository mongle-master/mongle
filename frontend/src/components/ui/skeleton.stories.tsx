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
  render: () => <Skeleton className="h-4 w-40" />,
}

export const CardPlaceholder: Story = {
  render: () => (
    <div className="flex w-full max-w-sm items-center gap-3">
      <Skeleton className="size-11 shrink-0 rounded-full" />
      <div className="flex flex-1 flex-col gap-2">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-2/3" />
      </div>
    </div>
  ),
}
