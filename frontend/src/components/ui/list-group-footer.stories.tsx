import { ListGroup } from '@/components/ui/list-group'
import { ListGroupFooter } from '@/components/ui/list-group-footer'
import { ListGroupItem } from '@/components/ui/list-group-item'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ListGroupFooter',
  component: ListGroupFooter,
  tags: ['autodocs'],
  args: {
    children: '자주 연락하는 사람일수록 위쪽에 정렬됩니다.',
  },
} satisfies Meta<typeof ListGroupFooter>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const BelowGroup: Story = {
  render: () => (
    <div className="w-80">
      <ListGroup>
        <ListGroupItem>엄마</ListGroupItem>
        <ListGroupItem>아빠</ListGroupItem>
        <ListGroupItem>동생</ListGroupItem>
      </ListGroup>
      <ListGroupFooter>
        자주 연락하는 사람일수록 위쪽에 정렬됩니다.
      </ListGroupFooter>
    </div>
  ),
}
