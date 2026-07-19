import { ListGroup } from '@/components/ui/list-group'
import { ListGroupItem } from '@/components/ui/list-group-item'
import { ListGroupLabel } from '@/components/ui/list-group-label'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ListGroupLabel',
  component: ListGroupLabel,
  tags: ['autodocs'],
  args: {
    children: '가족',
  },
} satisfies Meta<typeof ListGroupLabel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const AboveGroup: Story = {
  render: () => (
    <div className="w-80">
      <ListGroupLabel>가족</ListGroupLabel>
      <ListGroup>
        <ListGroupItem>엄마</ListGroupItem>
        <ListGroupItem>아빠</ListGroupItem>
        <ListGroupItem>동생</ListGroupItem>
      </ListGroup>
    </div>
  ),
}
