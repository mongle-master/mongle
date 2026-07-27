import { EmotionBadge } from './emotion-badge'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Domain/EmotionBadge',
  component: EmotionBadge,
  tags: ['autodocs'],
  argTypes: {
    emotion: {
      control: 'select',
      options: ['joy', 'calm', 'sadness', 'anger', 'anxiety', 'gratitude'],
    },
  },
} satisfies Meta<typeof EmotionBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Joy: Story = {
  args: { emotion: 'joy' },
}

export const Calm: Story = {
  args: { emotion: 'calm' },
}

export const Sadness: Story = {
  args: { emotion: 'sadness' },
}

export const Anger: Story = {
  args: { emotion: 'anger' },
}

export const Anxiety: Story = {
  args: { emotion: 'anxiety' },
}

export const Gratitude: Story = {
  args: { emotion: 'gratitude' },
}

export const AllEmotions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <EmotionBadge emotion="joy" />
      <EmotionBadge emotion="calm" />
      <EmotionBadge emotion="sadness" />
      <EmotionBadge emotion="anger" />
      <EmotionBadge emotion="anxiety" />
      <EmotionBadge emotion="gratitude" />
    </div>
  ),
}

export const WithoutDot: Story = {
  args: { emotion: 'joy', showDot: false },
}
