import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import type { ChipRef } from '@/apis/generated/mongle-api.schemas'
import { RelationTagFilter } from '@/components/home/relation-tag-filter'

const tags: ChipRef[] = [
  { id: 1, label: '가족', color: '#E85D75' },
  { id: 2, label: '친구', color: '#F97316' },
  { id: 3, label: '회사 동료', color: '#2563EB' },
  { id: 4, label: '스터디', color: '#22A06B' },
  { id: 5, label: '이웃', color: '#8B5CF6' },
]

const meta = {
  title: 'Home/RelationTagFilter',
  component: RelationTagFilter,
  tags: ['autodocs'],
  args: { tags, selectedIds: [], onToggle: () => {}, onClear: () => {} },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([])
    return (
      <RelationTagFilter
        {...args}
        selectedIds={selectedIds}
        onToggle={(tagId) =>
          setSelectedIds((current) =>
            current.includes(tagId)
              ? current.filter((id) => id !== tagId)
              : [...current, tagId],
          )
        }
        onClear={() => setSelectedIds([])}
      />
    )
  },
} satisfies Meta<typeof RelationTagFilter>

export default meta

type Story = StoryObj<typeof meta>

export const NoneSelected: Story = {}

export const MultiSelected: Story = {
  args: { selectedIds: [1, 3] },
  render: (args) => {
    const [selectedIds, setSelectedIds] = useState<number[]>([1, 3])
    return (
      <RelationTagFilter
        {...args}
        selectedIds={selectedIds}
        onToggle={(tagId) =>
          setSelectedIds((current) =>
            current.includes(tagId)
              ? current.filter((id) => id !== tagId)
              : [...current, tagId],
          )
        }
        onClear={() => setSelectedIds([])}
      />
    )
  },
}
