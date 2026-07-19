import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelineFilterReset } from '@/components/timeline/timeline-filter-reset'

const meta = {
  title: 'Timeline/FilterReset',
  component: TimelineFilterReset,
  tags: ['autodocs'],
  args: {
    visible: true,
    onReset: () => {},
  },
} satisfies Meta<typeof TimelineFilterReset>

export default meta

type Story = StoryObj<typeof meta>

export const ResetVisible: Story = {
  render: () => <TimelineFilterReset visible onReset={() => {}} />,
}

export const ResetHidden: Story = {
  render: () => <TimelineFilterReset visible={false} onReset={() => {}} />,
}
