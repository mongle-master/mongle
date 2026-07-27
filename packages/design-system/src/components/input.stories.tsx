import { Input } from './input'
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

export const Default: Story = {}

export const WithValue: Story = {
  args: { defaultValue: '김성빈' },
}

export const Disabled: Story = {
  args: { disabled: true, placeholder: '비활성' },
}
