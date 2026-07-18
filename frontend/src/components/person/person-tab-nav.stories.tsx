import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PersonTabNav } from '@/components/person/person-tab-nav'
import type { PersonView } from '@/stackflow/stackflow.config'

function PersonTabNavDemo({ initial }: { initial: PersonView }) {
  const [active, setActive] = useState<PersonView>(initial)
  return (
    <div className="max-w-md">
      <PersonTabNav active={active} onSelect={setActive} />
    </div>
  )
}

const meta = {
  title: 'Person/PersonTabNav',
  component: PersonTabNav,
  tags: ['autodocs'],
  args: {
    active: 'profile',
    onSelect: () => {},
  },
  render: (args) => <PersonTabNavDemo initial={args.active} />,
} satisfies Meta<typeof PersonTabNav>

export default meta

type Story = StoryObj<typeof meta>

export const ProfileActive: Story = {
  args: { active: 'profile' },
}

export const TimelineActive: Story = {
  args: { active: 'timeline' },
}
