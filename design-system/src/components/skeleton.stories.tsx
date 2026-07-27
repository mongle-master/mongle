import type { Meta, StoryObj } from '@storybook/react-vite'

import { Skeleton } from './skeleton'

const meta = {
  title: 'Core/Skeleton',
  component: Skeleton,
} satisfies Meta<typeof Skeleton>

export default meta
type Story = StoryObj<typeof meta>

export const DiaryCardLoading: Story = {
  render: () => (
    <div className="flex w-96 flex-col gap-3 rounded-xl border border-border bg-card p-6">
      <Skeleton className="h-3 w-20" />
      <Skeleton className="h-5 w-2/3" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  ),
}
