import * as React from 'react'
import { ChipPicker } from '@/components/ui/chip-picker'
import type { ChipPickerChip } from '@/components/ui/chip-picker'
import { GYEOL_CHIP_PALETTE } from '@/lib/relation-tag-colors'
import type { Meta, StoryObj } from '@storybook/react-vite'

const EMOTION_CHIPS: ChipPickerChip[] = [
  { id: 1, label: '기쁨', color: '#D96A3D' },
  { id: 2, label: '감사', color: GYEOL_CHIP_PALETTE[2] },
  { id: 3, label: '사랑', color: GYEOL_CHIP_PALETTE[0] },
  { id: 4, label: '평온', color: GYEOL_CHIP_PALETTE[4] },
  { id: 5, label: '슬픔', color: GYEOL_CHIP_PALETTE[6] },
  { id: 6, label: '힘듦', color: GYEOL_CHIP_PALETTE[3] },
]

const meta = {
  title: 'UI/ChipPicker',
  component: ChipPicker,
  tags: ['autodocs'],
  args: {
    chips: EMOTION_CHIPS,
    multiple: true,
    ariaLabel: '오늘의 감정',
  },
} satisfies Meta<typeof ChipPicker>

export default meta

type Story = StoryObj<typeof meta>

function MultiDemo() {
  const [value, setValue] = React.useState<number[]>([2, 4])
  return (
    <ChipPicker
      ariaLabel="오늘의 감정"
      chips={EMOTION_CHIPS}
      multiple
      value={value}
      onValueChange={(next) => setValue(next as number[])}
    />
  )
}

function SingleDemo() {
  const [value, setValue] = React.useState<number>(1)
  return (
    <ChipPicker
      ariaLabel="카테고리"
      chips={[
        { id: 1, label: '일상', color: GYEOL_CHIP_PALETTE[4] },
        { id: 2, label: '여행', color: GYEOL_CHIP_PALETTE[0] },
        { id: 3, label: '업무', color: GYEOL_CHIP_PALETTE[7] },
      ]}
      value={value}
      onValueChange={(next) => setValue(next as number)}
    />
  )
}

export const Multiple: Story = {
  render: () => <MultiDemo />,
}

export const Single: Story = {
  render: () => <SingleDemo />,
}

export const NoColors: Story = {
  render: () => (
    <ChipPicker
      ariaLabel="색 없는 칩"
      chips={[
        { id: 1, label: '태그 A' },
        { id: 2, label: '태그 B' },
      ]}
      multiple
    />
  ),
}
