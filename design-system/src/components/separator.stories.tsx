import type { Meta, StoryObj } from '@storybook/react-vite'

import { Separator } from './separator'

const meta = {
  title: 'Core/Separator',
  component: Separator,
} satisfies Meta<typeof Separator>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-3">
      <p className="text-body-sm text-body">어제의 기록</p>
      <Separator />
      <p className="text-body-sm text-body">오늘의 기록</p>
    </div>
  ),
}
