import type { Meta, StoryObj } from '@storybook/react-vite'

import { OnThisDayCard } from './on-this-day-card'

const meta = {
  title: 'Domain/OnThisDayCard',
  component: OnThisDayCard,
} satisfies Meta<typeof OnThisDayCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    originalDate: '2025년 7월 27일',
    quote: '첫 출근 날. 아무것도 모르지만 그래도 설렜다. 잘하고 싶다.',
    emotion: 'warm',
  },
}

export const Muse: Story = {
  args: {
    originalDate: '2025년 7월 27일',
    quote: '비 오는 창밖을 한참 봤다. 아무 일도 없는 날도 기록할 가치가 있다.',
    emotion: 'muse',
  },
}
