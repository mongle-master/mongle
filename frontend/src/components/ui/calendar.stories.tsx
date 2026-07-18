import { useState } from 'react'
import type { DateRange } from 'react-day-picker'
import { Calendar } from '@/components/ui/calendar'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Calendar',
  component: Calendar,
  tags: ['autodocs'],
} satisfies Meta<typeof Calendar>

export default meta

type Story = StoryObj<typeof meta>

export const SingleSelect: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>(
      new Date(2026, 6, 18),
    )
    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        defaultMonth={new Date(2026, 6, 18)}
      />
    )
  },
}

export const RangeSelect: Story = {
  render: () => {
    const [range, setRange] = useState<DateRange | undefined>({
      from: new Date(2026, 6, 10),
      to: new Date(2026, 6, 16),
    })
    return (
      <Calendar
        mode="range"
        selected={range}
        onSelect={setRange}
        defaultMonth={new Date(2026, 6, 10)}
      />
    )
  },
}

export const WithDisabledDays: Story = {
  render: () => {
    const [selected, setSelected] = useState<Date | undefined>()
    return (
      <Calendar
        mode="single"
        selected={selected}
        onSelect={setSelected}
        defaultMonth={new Date(2026, 6, 18)}
        disabled={{ after: new Date(2026, 6, 18) }}
      />
    )
  },
}
