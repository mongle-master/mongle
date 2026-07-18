import { MongleIcon } from '@/components/brand/mongle-logo'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Brand/MongleIcon',
  component: MongleIcon,
  tags: ['autodocs'],
} satisfies Meta<typeof MongleIcon>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomColor: Story = {
  args: { className: 'text-primary' },
}

export const LargeSize: Story = {
  args: { className: 'size-16' },
}
