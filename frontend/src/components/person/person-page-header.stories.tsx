import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { PersonPageHeader } from '@/components/person/person-page-header'
import type { PersonView } from '@/stackflow/stackflow.config'

function PersonPageHeaderDemo({ initial }: { initial: PersonView }) {
  const [active, setActive] = useState<PersonView>(initial)
  return (
    <div className="max-w-md">
      <PersonPageHeader
        active={active}
        onSelectView={setActive}
        onBack={() => {}}
      />
    </div>
  )
}

const meta = {
  title: 'Person/PersonPageHeader',
  component: PersonPageHeader,
  tags: ['autodocs'],
  args: {
    active: 'profile',
    onSelectView: () => {},
    onBack: () => {},
  },
  render: (args) => <PersonPageHeaderDemo initial={args.active} />,
} satisfies Meta<typeof PersonPageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const ProfileActive: Story = {
  args: { active: 'profile' },
}

export const TimelineActive: Story = {
  args: { active: 'timeline' },
}
