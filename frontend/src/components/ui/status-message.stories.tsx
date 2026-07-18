import { StatusMessage } from '@/components/ui/status-message'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/StatusMessage',
  component: StatusMessage,
  tags: ['autodocs'],
  args: {
    children: '타임라인을 불러오는 중…',
  },
  argTypes: {
    tone: {
      control: 'inline-radio',
      options: ['muted', 'error'],
    },
    inset: {
      control: 'inline-radio',
      options: ['screen', 'list'],
    },
  },
} satisfies Meta<typeof StatusMessage>

export default meta

type Story = StoryObj<typeof meta>

export const Loading: Story = {
  args: { tone: 'muted', inset: 'list' },
}

export const Error: Story = {
  args: {
    tone: 'error',
    inset: 'list',
    children: '타임라인을 불러오지 못했어요.',
  },
}

export const Screen: Story = {
  args: {
    tone: 'muted',
    inset: 'screen',
    children: '불러오는 중…',
  },
}
