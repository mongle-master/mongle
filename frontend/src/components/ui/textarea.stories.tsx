import { Textarea } from '@/components/ui/textarea'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: '메모를 입력하세요',
  },
} satisfies Meta<typeof Textarea>

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
  args: { defaultValue: '오랜만에 만났다. 반가웠다.' },
}
