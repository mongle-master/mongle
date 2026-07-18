import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ActivityFlowChart } from '@/components/timeline/activity-flow-chart'
import type {
  ActivityFlowRecord,
  ActivityFlowSelection,
} from '@/lib/timeline-activity-flow'
import type { PersonImageGender } from '@/lib/default-person-image'

// 뷰 시점과 무관하게 점이 보이도록 과거 연도(2024)로 고정한다.
// resolveWindow가 최신 기록일이 현재 연도보다 앞서면 그 기록일을 기준으로
// 기간 창을 잡아 주므로, 언제 열어도 dots가 렌더된다.
const PERSONS: {
  id: number
  name: string
  profileImageUrl?: string | null
  gender?: PersonImageGender
}[] = [
  { id: 1, name: '엄마', gender: 'FEMALE' },
  { id: 2, name: '김민수', gender: 'MALE' },
  { id: 3, name: '이지은', gender: 'FEMALE' },
]

const RECORDS: ActivityFlowRecord[] = [
  { id: 'r1', date: '2024-01-20', personId: 3 },
  { id: 'r2', date: '2024-02-10', personId: 1 },
  { id: 'r3', date: '2024-03-15', personId: 2 },
  { id: 'r4', date: '2024-05-22', personId: 1 },
  { id: 'r5', date: '2024-06-11', personId: 3 },
  { id: 'r6', date: '2024-07-30', personId: 2 },
  { id: 'r7', date: '2024-09-03', personId: 1 },
  { id: 'r8', date: '2024-11-05', personId: 3 },
]

const RECORDS_WITH_PHOTOS: ActivityFlowRecord[] = RECORDS.map((record, i) => ({
  ...record,
  photoUrl: `https://picsum.photos/seed/flow${i}/200`,
}))

const meta = {
  title: 'Timeline/ActivityFlowChart',
  component: ActivityFlowChart,
  tags: ['autodocs'],
  // 각 스토리는 render로 상태를 직접 관리한다. 여기 args는 필수 prop 타입만 채운다.
  args: {
    persons: PERSONS,
    records: RECORDS,
  },
} satisfies Meta<typeof ActivityFlowChart>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => {
    const [selected, setSelected] = useState<ActivityFlowSelection | null>(null)
    return (
      <ActivityFlowChart
        persons={PERSONS}
        records={RECORDS}
        selectedPoint={selected}
        onSelectPoint={setSelected}
      />
    )
  },
}

export const WithPhotos: Story = {
  render: () => {
    const [selected, setSelected] = useState<ActivityFlowSelection | null>(null)
    return (
      <ActivityFlowChart
        persons={PERSONS}
        records={RECORDS_WITH_PHOTOS}
        selectedPoint={selected}
        onSelectPoint={setSelected}
      />
    )
  },
}

export const Empty: Story = {
  render: () => <ActivityFlowChart persons={PERSONS} records={[]} />,
}
