import { Star } from 'lucide-react'
import { Toggle } from '@/components/ui/toggle'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Toggle',
  component: Toggle,
  tags: ['autodocs'],
  args: {
    children: (
      <>
        <Star />
        즐겨찾기
      </>
    ),
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['default', 'outline'],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg'],
    },
  },
} satisfies Meta<typeof Toggle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Sizes: Story = {
  render: (args) => (
    <div className="flex items-center gap-4">
      <Toggle {...args} size="sm" />
      <Toggle {...args} size="default" />
      <Toggle {...args} size="lg" />
    </div>
  ),
}

export const Pressed: Story = {
  args: { defaultPressed: true },
}

export const Disabled: Story = {
  args: { disabled: true },
}
