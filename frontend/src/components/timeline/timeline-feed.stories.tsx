import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelineFeed } from '@/components/timeline/timeline-feed'

type FeedItem = {
  id: number
  occurredDate: string
  title: string
  memo: string
}

const SINGLE_YEAR_ITEMS: FeedItem[] = [
  {
    id: 1,
    occurredDate: '2024-11-05',
    title: '엄마 · 식사',
    memo: '오랜만에 만났다. 김치찌개를 먹었다.',
  },
  {
    id: 2,
    occurredDate: '2024-07-30',
    title: '김민수 · 여행',
    memo: '강릉 바다를 보고 왔다.',
  },
  {
    id: 3,
    occurredDate: '2024-03-15',
    title: '이지은 · 만남',
    memo: '카페에서 두 시간 수다.',
  },
]

const MULTI_YEAR_ITEMS: FeedItem[] = [
  {
    id: 10,
    occurredDate: '2024-09-03',
    title: '엄마 · 경조사',
    memo: '외삼촌 결혼식에 함께 갔다.',
  },
  {
    id: 11,
    occurredDate: '2024-01-20',
    title: '이지은 · 만남',
    memo: '새해 첫 모임.',
  },
  {
    id: 12,
    occurredDate: '2023-12-24',
    title: '김민수 · 식사',
    memo: '크리스마스 이브 저녁.',
  },
  {
    id: 13,
    occurredDate: '2022-06-11',
    title: '엄마 · 여행',
    memo: '제주도 가족 여행.',
  },
]

function FeedCard({ item }: { item: FeedItem }) {
  return (
    <div className="rounded-2xl border border-border bg-card p-4">
      <p className="text-sm font-extrabold">{item.title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{item.memo}</p>
    </div>
  )
}

const meta = {
  title: 'Timeline/TimelineFeed',
  component: TimelineFeed,
  tags: ['autodocs'],
  // 각 스토리는 render로 구체 타입의 items·renderCard를 넘긴다.
  // 여기 args는 제네릭 기본 타입(TimelineFeedItem) 기준의 필수 prop 타입만 채운다.
  args: {
    items: [],
    renderCard: () => null,
  },
} satisfies Meta<typeof TimelineFeed>

export default meta

type Story = StoryObj<typeof meta>

export const SingleYear: Story = {
  render: () => (
    <TimelineFeed
      items={SINGLE_YEAR_ITEMS}
      renderCard={(item) => <FeedCard item={item} />}
    />
  ),
}

export const MultipleYears: Story = {
  render: () => (
    <TimelineFeed
      items={MULTI_YEAR_ITEMS}
      renderCard={(item) => <FeedCard item={item} />}
    />
  ),
}

export const Empty: Story = {
  render: () => (
    <TimelineFeed
      items={[] as FeedItem[]}
      renderCard={(item) => <FeedCard item={item} />}
    />
  ),
}
