import { useState } from 'react'
import { DateStrip } from '@/components/record/date-time-wheel'
import { todayLocalIso } from '@/lib/format'
import type { Meta, StoryObj } from '@storybook/react-vite'

// DateStrip은 오늘~29일 전 30일만 렌더한다. 그 창 밖 날짜를 넘기면 선택 표시가 안 걸리므로
// 컴포넌트와 동일한(UTC 고정) 방식으로 창 안의 날짜를 만든다.
function isoDaysAgo(back: number) {
  const base = new Date(`${todayLocalIso()}T00:00:00Z`)
  base.setUTCDate(base.getUTCDate() - back)
  return base.toISOString().slice(0, 10)
}

const meta = {
  title: 'Record/DateStrip',
  component: DateStrip,
  tags: ['autodocs'],
  args: {
    value: '',
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return <DateStrip value={value} onChange={setValue} />
  },
} satisfies Meta<typeof DateStrip>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const TodaySelected: Story = {
  args: { value: todayLocalIso() },
}

export const PastDaySelected: Story = {
  args: { value: isoDaysAgo(5) },
}
