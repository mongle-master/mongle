import { Textarea } from './textarea'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Textarea',
  component: Textarea,
  tags: ['autodocs'],
  args: {
    placeholder: '오늘 하루는 어땠나요?',
  },
} satisfies Meta<typeof Textarea>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const DiaryInput: Story = {
  args: {
    className: 'letter-paper font-hand min-h-[200px] text-[15px] leading-[28px]',
    placeholder: '오늘의 기록을 남겨보세요...',
  },
}
