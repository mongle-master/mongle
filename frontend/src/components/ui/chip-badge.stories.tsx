import { ChipBadge } from '@/components/ui/chip-badge'
import { GYEOL_CHIP_PALETTE } from '@/lib/relation-tag-colors'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ChipBadge',
  component: ChipBadge,
  tags: ['autodocs'],
  args: {
    chip: { label: '감사', color: GYEOL_CHIP_PALETTE[2] },
  },
} satisfies Meta<typeof ChipBadge>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const NoColor: Story = {
  args: { chip: { label: '색 없음' } },
}

export const Emotions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <ChipBadge chip={{ label: '사랑', color: GYEOL_CHIP_PALETTE[0] }} />
      <ChipBadge chip={{ label: '감사', color: GYEOL_CHIP_PALETTE[2] }} />
      <ChipBadge chip={{ label: '평온', color: GYEOL_CHIP_PALETTE[4] }} />
      <ChipBadge chip={{ label: '슬픔', color: GYEOL_CHIP_PALETTE[6] }} />
      <ChipBadge chip={{ label: '힘듦', color: GYEOL_CHIP_PALETTE[3] }} />
    </div>
  ),
}
