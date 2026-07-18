import { useState } from 'react'
import { TimeWheel } from '@/components/record/date-time-wheel'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Record/TimeWheel',
  component: TimeWheel,
  tags: ['autodocs'],
  args: {
    value: '',
    onChange: () => {},
  },
  render: (args) => {
    const [value, setValue] = useState(args.value)
    return (
      <div className="mx-auto w-64">
        <TimeWheel value={value} onChange={setValue} />
      </div>
    )
  },
} satisfies Meta<typeof TimeWheel>

export default meta

type Story = StoryObj<typeof meta>

// 'HH:MM' 값이 있으면 휠 피커가 뜬다. 분은 5분 단위(00,05,…,55)만 유효하다.
export const WithTime: Story = {
  args: { value: '14:30' },
}

// 빈 문자열이면 '시간 모름' 상태로 휠이 숨는다.
export const TimeUnknown: Story = {
  args: { value: '' },
}
