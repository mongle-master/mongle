import { Avatar, AvatarFallback } from './avatar'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const Fallback: Story = {
  render: () => (
    <Avatar>
      <AvatarFallback>김</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-3">
      <Avatar className="size-8">
        <AvatarFallback className="text-xs">김</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>김</AvatarFallback>
      </Avatar>
      <Avatar className="size-14">
        <AvatarFallback className="text-lg">김</AvatarFallback>
      </Avatar>
    </div>
  ),
}
