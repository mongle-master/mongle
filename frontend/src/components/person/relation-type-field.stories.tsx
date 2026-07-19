import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RelationTypeField } from '@/components/person/relation-type-field'

function RelationTypeDemo({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="max-w-md">
      <RelationTypeField value={value} onChange={setValue} />
    </div>
  )
}

const meta = {
  title: 'Person/RelationTypeField',
  component: RelationTypeField,
  tags: ['autodocs'],
  args: {
    value: '',
    onChange: () => {},
  },
} satisfies Meta<typeof RelationTypeField>

export default meta

type Story = StoryObj<typeof meta>

export const RelationTypeDefault: Story = {
  render: () => <RelationTypeDemo />,
}

export const RelationTypeSelected: Story = {
  render: () => <RelationTypeDemo initial="친구" />,
}
