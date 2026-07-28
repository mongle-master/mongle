import { EmotionStatBar } from '@/components/ui/emotion-stat-bar'
import { GYEOL_CHIP_PALETTE } from '@/lib/relation-tag-colors'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/EmotionStatBar',
  component: EmotionStatBar,
  tags: ['autodocs'],
  args: {
    items: [
      { label: '기쁨', color: '#D96A3D', count: 17 },
      { label: '감사', color: GYEOL_CHIP_PALETTE[2], count: 12 },
      { label: '평온', color: GYEOL_CHIP_PALETTE[4], count: 9 },
      { label: '사랑', color: GYEOL_CHIP_PALETTE[0], count: 6 },
      { label: '슬픔', color: GYEOL_CHIP_PALETTE[6], count: 3 },
    ],
  },
} satisfies Meta<typeof EmotionStatBar>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { items: [] },
}
