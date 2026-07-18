import { Check } from 'lucide-react'
import {
  Avatar,
  AvatarBadge,
  AvatarFallback,
  AvatarGroup,
  AvatarGroupCount,
  AvatarImage,
} from '@/components/ui/avatar'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Avatar',
  component: Avatar,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['sm', 'default', 'lg'],
    },
  },
} satisfies Meta<typeof Avatar>

export default meta

type Story = StoryObj<typeof meta>

export const WithImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://picsum.photos/200" alt="김민수" />
      <AvatarFallback>김</AvatarFallback>
    </Avatar>
  ),
}

export const FallbackInitials: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarFallback>민</AvatarFallback>
    </Avatar>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <Avatar size="sm">
        <AvatarFallback>김</AvatarFallback>
      </Avatar>
      <Avatar size="default">
        <AvatarFallback>이</AvatarFallback>
      </Avatar>
      <Avatar size="lg">
        <AvatarFallback>박</AvatarFallback>
      </Avatar>
    </div>
  ),
}

export const WithBadge: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://picsum.photos/200" alt="김민수" />
      <AvatarFallback>김</AvatarFallback>
      <AvatarBadge>
        <Check />
      </AvatarBadge>
    </Avatar>
  ),
}

export const Group: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://picsum.photos/200?1" alt="김민수" />
        <AvatarFallback>김</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://picsum.photos/200?2" alt="이서연" />
        <AvatarFallback>이</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarFallback>박</AvatarFallback>
      </Avatar>
    </AvatarGroup>
  ),
}

export const GroupWithCount: Story = {
  render: () => (
    <AvatarGroup>
      <Avatar>
        <AvatarImage src="https://picsum.photos/200?1" alt="김민수" />
        <AvatarFallback>김</AvatarFallback>
      </Avatar>
      <Avatar>
        <AvatarImage src="https://picsum.photos/200?2" alt="이서연" />
        <AvatarFallback>이</AvatarFallback>
      </Avatar>
      <AvatarGroupCount>+3</AvatarGroupCount>
    </AvatarGroup>
  ),
}

export const BrokenImage: Story = {
  render: (args) => (
    <Avatar {...args}>
      <AvatarImage src="https://broken.invalid/avatar.png" alt="깨진 이미지" />
      <AvatarFallback>김</AvatarFallback>
    </Avatar>
  ),
}
