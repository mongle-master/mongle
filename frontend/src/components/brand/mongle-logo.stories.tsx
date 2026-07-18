import { MongleLogo } from '@/components/brand/mongle-logo'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Brand/MongleLogo',
  component: MongleLogo,
  tags: ['autodocs'],
} satisfies Meta<typeof MongleLogo>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const CustomColor: Story = {
  args: { className: 'text-primary' },
}

export const LargeSize: Story = {
  args: {
    iconClassName: 'size-10',
    textClassName: 'text-2xl',
  },
}
