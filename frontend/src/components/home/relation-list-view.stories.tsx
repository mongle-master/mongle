import type { Meta, StoryObj } from '@storybook/react-vite'
import type { PersonNode } from '@/apis/generated/mongle-api.schemas'
import { RelationListView } from '@/components/home/relation-list-view'

function person(
  id: number,
  name: string,
  daysSinceLastMeet: number | null,
  tag?: { id: number; label: string; color: string },
  favorite = false,
): PersonNode {
  return {
    id,
    name,
    profileImageUrl: null,
    avatarGender: null,
    favorite,
    recordCount: 10,
    relationTags: tag ? [tag] : [],
    intimacy: { status: 'NORMAL', daysSinceLastMeet },
    firstMetDate: '2023-03-01',
  }
}

const FAMILY = { id: 1, label: '가족', color: '#E85D75' }
const FRIEND = { id: 2, label: '친구', color: '#F97316' }

const nodes = [
  person(1, '김도윤', 3, FRIEND, true),
  person(2, '이서연', 6, FAMILY),
  person(3, '정해인', 11, FRIEND),
  person(4, '박민준', 26),
  person(5, '문가영', 178, FAMILY),
  person(6, '황지민', null),
]

const meta = {
  title: 'Home/RelationListView',
  component: RelationListView,
  tags: ['autodocs'],
  args: {
    nodes,
    selectedTagIds: [],
    onSelectPerson: () => {},
    onClearFilter: () => {},
  },
} satisfies Meta<typeof RelationListView>

export default meta

type Story = StoryObj<typeof meta>

export const Normal: Story = {}

export const FilteredFamily: Story = {
  args: { selectedTagIds: [FAMILY.id] },
}

export const NoMatch: Story = {
  args: { selectedTagIds: [9] },
}
