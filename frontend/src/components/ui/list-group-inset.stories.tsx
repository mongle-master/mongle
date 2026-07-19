import { ListGroup } from '@/components/ui/list-group'
import { ListGroupInset } from '@/components/ui/list-group-inset'
import { ListGroupItem } from '@/components/ui/list-group-item'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ListGroupInset',
  component: ListGroupInset,
  tags: ['autodocs'],
  args: {
    children: (
      <p className="text-sm text-muted-foreground">
        오랜만에 만났다. 요즘 이직 준비 중이라고 했다.
      </p>
    ),
  },
} satisfies Meta<typeof ListGroupInset>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const InListGroup: Story = {
  render: () => (
    <ListGroup className="w-80">
      <ListGroupItem withDivider={false}>
        <ListGroupInset>
          <p className="text-sm text-muted-foreground">
            오랜만에 만났다. 요즘 이직 준비 중이라고 했다.
          </p>
        </ListGroupInset>
      </ListGroupItem>
    </ListGroup>
  ),
}
