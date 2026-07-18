import { useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import type { HomePeriod } from '@/lib/home-period'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Home/HomePeriodToggle',
  component: HomePeriodToggle,
  tags: ['autodocs'],
  render: (args) => {
    const [value, setValue] = useState<HomePeriod>(args.value)
    return <HomePeriodToggle value={value} onChange={setValue} />
  },
} satisfies Meta<typeof HomePeriodToggle>

export default meta

type Story = StoryObj<typeof meta>

export const All: Story = {
  args: { value: 'ALL', onChange: () => {} },
}

export const FiveYears: Story = {
  args: { value: '5Y', onChange: () => {} },
}

export const ThreeYears: Story = {
  args: { value: '3Y', onChange: () => {} },
}

export const OneYear: Story = {
  args: { value: '1Y', onChange: () => {} },
}

export const OneMonth: Story = {
  args: { value: '1M', onChange: () => {} },
}
