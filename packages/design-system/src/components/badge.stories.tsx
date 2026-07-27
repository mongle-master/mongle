import { Badge } from './badge'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Badge',
  component: Badge,
  tags: ['autodocs'],
  args: {
    children: '배지',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'secondary', 'outline', 'destructive'],
    },
  },
} satisfies Meta<typeof Badge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Destructive: Story = {
  args: { variant: 'destructive', children: '삭제됨' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge>기본</Badge>
      <Badge variant="secondary">보조</Badge>
      <Badge variant="outline">테두리</Badge>
      <Badge variant="destructive">파괴</Badge>
    </div>
  ),
}
