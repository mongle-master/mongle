import {
  ListGroup,
  ListGroupFooter,
  ListGroupInset,
  ListGroupItem,
  ListGroupLabel,
} from '@/components/ui/list-group'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ListGroup',
  component: ListGroup,
  tags: ['autodocs'],
  args: {
    children: <ListGroupItem>엄마</ListGroupItem>,
  },
} satisfies Meta<typeof ListGroup>

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

export const WithLabelAndFooter: Story = {
  render: () => (
    <div className="w-80">
      <ListGroupLabel>가족</ListGroupLabel>
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

export const Inset: Story = {
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
