import type { Meta, StoryObj } from '@storybook/react-vite'

import { PersonChip } from './person-chip'

const meta = {
  title: 'Person/PersonChip',
  component: PersonChip,
  tags: ['autodocs'],
  args: {
    name: '김서연',
  },
} satisfies Meta<typeof PersonChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Favorite: Story = {
  args: {
    favorite: true,
  },
}

export const MultiplePeople: Story = {
  args: {
    label: '김서연 외 2명',
  },
}

export const InCardContext: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2 rounded-xl bg-card p-4 ring-1 ring-foreground/10">
      <p className="text-body font-extrabold text-foreground">
        서연이와 한강 산책
      </p>
      <div className="flex flex-wrap gap-1.5">
        <PersonChip name="김서연" />
        <PersonChip name="이하준" label="이하준 외 1명" />
      </div>
    </div>
  ),
}
