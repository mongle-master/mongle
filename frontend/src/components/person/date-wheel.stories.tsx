import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DateWheel } from '@/components/person/date-wheel'

function DateWheelDemo(args: ComponentProps<typeof DateWheel>) {
  const [date, setDate] = useState({
    year: args.year,
    month: args.month,
    day: args.day,
  })
  return (
    <div className="max-w-xs">
      <DateWheel
        {...args}
        year={date.year}
        month={date.month}
        day={date.day}
        onChange={setDate}
      />
    </div>
  )
}

const meta = {
  title: 'Person/DateWheel',
  component: DateWheel,
  tags: ['autodocs'],
  args: {
    year: '1994',
    month: '3',
    day: '17',
    onChange: () => {},
  },
  argTypes: {
    yearOptional: { control: 'boolean' },
  },
  render: (args) => <DateWheelDemo {...args} />,
} satisfies Meta<typeof DateWheel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Empty: Story = {
  args: { year: '', month: '', day: '' },
}

// 생일: 연도 없이 월·일만 남길 수 있어 연도 휠에 '모름'이 추가된다.
export const BirthdayYearOptional: Story = {
  args: { yearOptional: true, year: '', month: '5', day: '20' },
}

export const FirstMet: Story = {
  args: { year: '2019', month: '11', day: '2' },
}
