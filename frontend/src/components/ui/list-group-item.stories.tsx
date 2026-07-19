import { ListGroup } from '@/components/ui/list-group'
import { ListGroupItem } from '@/components/ui/list-group-item'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ListGroupItem',
  component: ListGroupItem,
  tags: ['autodocs'],
  args: {
    children: '엄마',
  },
} satisfies Meta<typeof ListGroupItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <ListGroup className="w-80">
      <ListGroupItem>엄마</ListGroupItem>
      <ListGroupItem>김민수</ListGroupItem>
      <ListGroupItem>이서연</ListGroupItem>
    </ListGroup>
  ),
}

export const WithoutDivider: Story = {
  render: () => (
    <ListGroup className="w-80">
      <ListGroupItem withDivider={false}>
        구분선이 없는 마지막 항목
      </ListGroupItem>
    </ListGroup>
  ),
}
