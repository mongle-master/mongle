import { useState } from 'react'
import { OccurredDateTimeField } from '@/components/record/occurred-date-time-field'
import { todayLocalIso } from '@/lib/format'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Record/OccurredDateTimeField',
  component: OccurredDateTimeField,
  tags: ['autodocs'],
  args: {
    date: '',
    time: '',
    onDateChange: () => {},
    onTimeChange: () => {},
  },
  render: (args) => {
    const [date, setDate] = useState(args.date)
    const [time, setTime] = useState(args.time)
    return (
      <div className="w-80">
        <OccurredDateTimeField
          date={date}
          time={time}
          onDateChange={setDate}
          onTimeChange={setTime}
        />
      </div>
    )
  },
} satisfies Meta<typeof OccurredDateTimeField>

export default meta

type Story = StoryObj<typeof meta>

// 날짜·시간 모두 미선택 — '날짜 선택' / '시간' 플레이스홀더 상태.
export const Default: Story = {}

export const WithTime: Story = {
  args: { date: todayLocalIso(), time: '14:30' },
}

// 날짜만 선택되고 시간은 비어 있는 상태.
export const EmptyTime: Story = {
  args: { date: todayLocalIso(), time: '' },
}
