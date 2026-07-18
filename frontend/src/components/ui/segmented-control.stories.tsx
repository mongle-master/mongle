import { useState } from 'react'

import { SegmentedControl } from '@/components/ui/segmented-control'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/SegmentedControl',
  component: SegmentedControl,
  tags: ['autodocs'],
  args: {
    value: 'list',
    onValueChange: () => {},
    options: [
      { value: 'list', label: '목록' },
      { value: 'grid', label: '그리드' },
    ],
  },
} satisfies Meta<typeof SegmentedControl>

export default meta

type Story = StoryObj<typeof meta>

export const TwoOptions: Story = {
  render: () => {
    const [value, setValue] = useState('list')
    return (
      <div className="w-72 rounded-xl bg-muted/50 p-1">
        <SegmentedControl
          value={value}
          onValueChange={setValue}
          options={[
            { value: 'list', label: '목록' },
            { value: 'grid', label: '그리드' },
          ]}
        />
      </div>
    )
  },
}

export const ThreeOptions: Story = {
  render: () => {
    const [value, setValue] = useState('all')
    return (
      <div className="w-80 rounded-xl bg-muted/50 p-1">
        <SegmentedControl
          value={value}
          onValueChange={setValue}
          options={[
            { value: 'all', label: '전체' },
            { value: 'family', label: '가족' },
            { value: 'friend', label: '친구' },
          ]}
        />
      </div>
    )
  },
}
