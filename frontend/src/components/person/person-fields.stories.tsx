import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ListField, RelationTypeField } from '@/components/person/person-fields'

function ListFieldDemo(args: ComponentProps<typeof ListField>) {
  const [items, setItems] = useState(args.items)
  return (
    <div className="max-w-md">
      <ListField {...args} items={items} onChange={setItems} />
    </div>
  )
}

function RelationTypeDemo({ initial = '' }: { initial?: string }) {
  const [value, setValue] = useState(initial)
  return (
    <div className="max-w-md">
      <RelationTypeField value={value} onChange={setValue} />
    </div>
  )
}

// 한 파일에 ListField/RelationTypeField 두 컴포넌트를 담는다(원본이 person-fields.tsx 한 파일).
// meta.component은 ListField 기준이고, RelationType 스토리는 render로 직접 그린다.
const meta = {
  title: 'Person/PersonFields',
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

export const RelationTypeDefault: Story = {
  render: () => <RelationTypeDemo />,
}

export const RelationTypeSelected: Story = {
  render: () => <RelationTypeDemo initial="친구" />,
}
