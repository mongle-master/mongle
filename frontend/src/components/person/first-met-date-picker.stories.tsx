import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatePartPicker } from '@/components/person/first-met-date-picker'

function DatePartPickerDemo(args: ComponentProps<typeof DatePartPicker>) {
  const [date, setDate] = useState({
    year: args.year,
    month: args.month,
    day: args.day,
  })
  return (
    <div className="max-w-xs">
      <DatePartPicker
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
  title: 'Person/DatePartPicker',
  component: DatePartPicker,
  tags: ['autodocs'],
  args: {
    year: '',
    month: '',
    day: '',
    onChange: () => {},
  },
  argTypes: {
    yearRequired: { control: 'boolean' },
  },
  render: (args) => <DatePartPickerDemo {...args} />,
} satisfies Meta<typeof DatePartPicker>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Filled: Story = {
  args: { year: '2018', month: '12', day: '25' },
}

// yearRequired면 연도 자리에 빨간 점 표시가 붙는다.
export const YearRequired: Story = {
  args: { yearRequired: true, year: '', month: '6', day: '15' },
}

export const Empty: Story = {
  args: { year: '', month: '', day: '' },
}
