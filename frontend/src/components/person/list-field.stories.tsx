import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListField } from '@/components/person/list-field'

function ListFieldDemo(args: ComponentProps<typeof ListField>) {
  const [items, setItems] = useState(args.items)
  return (
    <div className="max-w-md">
      <ListField {...args} items={items} onChange={setItems} />
    </div>
  )
}

const meta = {
  title: 'Person/ListField',
  component: ListField,
  tags: ['autodocs'],
  args: {
    label: '좋아하는 것',
    items: [],
    placeholder: '예: 산책, 라떼',
    onChange: () => {},
  },
  render: (args) => <ListFieldDemo {...args} />,
} satisfies Meta<typeof ListField>

export default meta

type Story = StoryObj<typeof meta>

export const ListFieldEmpty: Story = {}

export const ListFieldWithItems: Story = {
  args: { items: ['산책', '라떼', '고양이'] },
}

export const ListFieldGreenTone: Story = {
  args: { tone: 'green', items: ['커피', '노래'] },
}

export const ListFieldRedTone: Story = {
  args: { label: '조심할 것', tone: 'red', items: ['매운 음식'] },
}

export const ListFieldCompact: Story = {
  args: { compact: true, items: ['등산', '아메리카노'] },
}

// maxItems를 낮춰 이미 가득 찬 상태 — 항목을 더 추가하려 하면 초과 에러가 뜬다.
export const ListFieldMaxItems: Story = {
  args: { maxItems: 3, items: ['하나', '둘', '셋'] },
}
