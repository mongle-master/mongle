import { Input } from '@/components/ui/input'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Input',
  component: Input,
  tags: ['autodocs'],
  args: {
    placeholder: '이름을 입력하세요',
  },
} satisfies Meta<typeof Input>

export default meta

type Story = StoryObj<typeof meta>

export const Placeholder: Story = {}

export const Disabled: Story = {
  args: { disabled: true },
}

export const Invalid: Story = {
  args: { 'aria-invalid': true },
}

export const WithValue: Story = {
  args: { defaultValue: '김민수' },
}

export const Password: Story = {
  args: { type: 'password', defaultValue: 'mongle1234' },
}
