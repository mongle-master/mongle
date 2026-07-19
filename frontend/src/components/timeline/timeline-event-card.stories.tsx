import type { Meta, StoryObj } from '@storybook/react-vite'
import { TimelineEventCard } from '@/components/timeline/timeline-event-card'
import type { TimelineEventCardItem } from '@/components/timeline/timeline-event-card'

const FULL_ITEM: TimelineEventCardItem = {
  id: 1,
  title: '엄마와 봄나들이',
  memo: '오랜만에 벚꽃 구경을 갔다. 김밥을 싸서 한강에서 하루 종일 걸었다.',
  occurredDate: '2026-04-05',
  category: { id: 10, label: '나들이' },
  persons: [
    { id: 3, name: '엄마', profileImageUrl: undefined, favorite: true },
    { id: 4, name: '이모', profileImageUrl: undefined, favorite: false },
  ],
  emotions: [
    { id: 20, label: '설렘' },
    { id: 21, label: '평온' },
  ],
  photoUrls: [
    'https://picsum.photos/seed/mongle1/256',
    'https://picsum.photos/seed/mongle2/256',
  ],
}

const MINIMAL_ITEM: TimelineEventCardItem = {
  id: 2,
  title: '혼자 마신 커피',
  occurredDate: '2026-03-18',
}

const meta = {
  title: 'Timeline/TimelineEventCard',
  component: TimelineEventCard,
  tags: ['autodocs'],
  args: {
    item: FULL_ITEM,
    onSelect: () => {},
  },
  // 카드는 flex-1 버튼이라 부모 폭이 있어야 레이아웃이 드러난다.
  decorators: [
    (Story) => (
      <div className="flex max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TimelineEventCard>

export default meta

type Story = StoryObj<typeof meta>

export const Full: Story = {}

export const Minimal: Story = {
  args: { item: MINIMAL_ITEM },
}
