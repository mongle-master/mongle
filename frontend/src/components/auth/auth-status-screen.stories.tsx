import { AuthStatusScreen } from '@/components/auth/auth-status-screen'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Auth/AuthStatusScreen',
  component: AuthStatusScreen,
  tags: ['autodocs'],
  args: {
    username: '김민수',
    error: false,
    onRetry: () => {},
  },
  argTypes: {
    error: { control: 'boolean' },
  },
} satisfies Meta<typeof AuthStatusScreen>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: { error: false },
}

export const Error: Story = {
  args: { error: true },
}
