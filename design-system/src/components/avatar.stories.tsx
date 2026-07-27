import type { Meta, StoryObj } from '@storybook/react-vite'

import { Avatar } from './avatar'

const meta = {
  title: 'Core/Avatar',
  component: Avatar,
} satisfies Meta<typeof Avatar>

export default meta
type Story = StoryObj<typeof meta>

export const Sizes: Story = {
  args: { fallback: '김' },
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar fallback="김" size="sm" />
      <Avatar fallback="서" />
      <Avatar fallback="한" size="lg" />
    </div>
  ),
}
