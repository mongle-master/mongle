import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ChipResponse } from '@/apis/generated/mongle-api.schemas'
import { TimelineCategoryFilters } from '@/components/timeline/timeline-category-filters'

const CATEGORY_CHIPS: ChipResponse[] = [
  {
    id: 1,
    type: 'CATEGORY',
    label: '만남',
    personal: false,
    order: 0,
    default: true,
  },
  {
    id: 2,
    type: 'CATEGORY',
    label: '식사',
    personal: false,
    order: 1,
    default: false,
  },
  {
    id: 3,
    type: 'CATEGORY',
    label: '여행',
    personal: true,
    order: 2,
    default: false,
  },
  {
    id: 4,
    type: 'CATEGORY',
    label: '경조사',
    personal: false,
    order: 3,
    default: false,
  },
]

const toggle = (ids: number[], id: number) =>
  ids.includes(id) ? ids.filter((x) => x !== id) : [...ids, id]

const meta = {
  title: 'Timeline/CategoryFilters',
  component: TimelineCategoryFilters,
  tags: ['autodocs'],
  // 각 스토리는 render로 상태를 직접 관리한다. 여기 args는 필수 prop 타입만 채운다.
  args: {
    chips: CATEGORY_CHIPS,
    selectedIds: [],
    onToggle: () => {},
  },
} satisfies Meta<typeof TimelineCategoryFilters>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<number[]>([])
    return (
      <TimelineCategoryFilters
        chips={CATEGORY_CHIPS}
        selectedIds={selected}
        onToggle={(id) => setSelected((prev) => toggle(prev, id))}
      />
    )
  },
}

export const SomeSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState<number[]>([2])
    return (
      <TimelineCategoryFilters
        chips={CATEGORY_CHIPS}
        selectedIds={selected}
        onToggle={(id) => setSelected((prev) => toggle(prev, id))}
      />
    )
  },
}

export const AllSelected: Story = {
  render: () => {
    const [selected, setSelected] = useState<number[]>(
      CATEGORY_CHIPS.map((chip) => chip.id),
    )
    return (
      <TimelineCategoryFilters
        chips={CATEGORY_CHIPS}
        selectedIds={selected}
        onToggle={(id) => setSelected((prev) => toggle(prev, id))}
      />
    )
  },
}
