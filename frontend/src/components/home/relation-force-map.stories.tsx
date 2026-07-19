import type { Meta, StoryObj } from '@storybook/react-vite'
import { RelationForceMap } from '@/components/home/relation-force-map'
import type {
  MeNode,
  PersonNode,
  RelationEdge,
} from '@/apis/generated/mongle-api.schemas'

const ME: MeNode = {
  label: '나',
  id: '00000000-0000-0000-0000-000000000000',
  name: '몽글',
  profileImageUrl: undefined,
  avatarGender: 'FEMALE',
}

// 관계태그(relationTags) 첫 칩이 노드의 카테고리(색·범례)를 결정한다.
const NODES: PersonNode[] = [
  {
    id: 1,
    name: '엄마',
    profileImageUrl: undefined,
    avatarGender: 'FEMALE',
    favorite: true,
    recordCount: 24,
    relationTags: [{ id: 100, label: '가족', color: '#2f6eea' }],
    intimacy: {
      status: 'NORMAL',
      averageIntervalDays: 14,
      daysSinceLastMeet: 3,
    },
    firstMetDate: '2019-01-01',
  },
  {
    id: 2,
    name: '김민수',
    profileImageUrl: undefined,
    avatarGender: 'MALE',
    favorite: false,
    recordCount: 12,
    relationTags: [{ id: 101, label: '친구', color: '#28b945' }],
    intimacy: {
      status: 'NORMAL',
      averageIntervalDays: 30,
      daysSinceLastMeet: 12,
    },
    firstMetDate: '2021-03-10',
  },
  {
    id: 3,
    name: '이지은',
    profileImageUrl: undefined,
    avatarGender: 'FEMALE',
    favorite: false,
    recordCount: 8,
    relationTags: [{ id: 101, label: '친구', color: '#28b945' }],
    intimacy: {
      status: 'DISTANT',
      averageIntervalDays: 45,
      daysSinceLastMeet: 90,
    },
    firstMetDate: '2022-06-11',
  },
  {
    id: 4,
    name: '박대리',
    profileImageUrl: undefined,
    avatarGender: 'MALE',
    favorite: false,
    recordCount: 5,
    relationTags: [{ id: 102, label: '직장', color: '#ff8a00' }],
    intimacy: {
      status: 'UNKNOWN',
      averageIntervalDays: undefined,
      daysSinceLastMeet: undefined,
    },
    firstMetDate: '2023-09-01',
  },
]

const EDGES: RelationEdge[] = [
  { personId: 1, distant: false },
  { personId: 2, distant: false },
  { personId: 3, distant: true },
  { personId: 4, distant: false },
]

const meta = {
  title: 'Home/RelationForceMap',
  component: RelationForceMap,
  tags: ['autodocs'],
  args: {
    me: ME,
    nodes: NODES,
    edges: EDGES,
    onSelectPerson: () => {},
  },
} satisfies Meta<typeof RelationForceMap>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const SinglePerson: Story = {
  args: {
    nodes: [NODES[0]],
    edges: [EDGES[0]],
  },
}

export const Empty: Story = {
  args: {
    nodes: [],
    edges: [],
  },
}
