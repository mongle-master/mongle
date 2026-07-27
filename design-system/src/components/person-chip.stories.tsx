import type { Meta, StoryObj } from '@storybook/react-vite'

import { PersonChip } from './person-chip'

const meta = {
  title: 'Domain/PersonChip',
  component: PersonChip,
} satisfies Meta<typeof PersonChip>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { name: '김서연' },
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <PersonChip name="김서연" />
      <PersonChip name="이하준" />
      <PersonChip name="한지민" size="sm" />
    </div>
  ),
}
