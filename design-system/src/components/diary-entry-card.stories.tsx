import type { Meta, StoryObj } from '@storybook/react-vite'

import { DiaryEntryCard } from './diary-entry-card'

const meta = {
  title: 'Domain/DiaryEntryCard',
  component: DiaryEntryCard,
} satisfies Meta<typeof DiaryEntryCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    date: '2026년 7월 27일 · 월',
    title: '서연이와 한강 산책',
    bodyPreview:
      '퇴근하고 한강에서 만났다. 편의점 커피를 들고 걷다가 해가 지는 걸 끝까지 봤다. 요즘 고민을 털어놓았는데, 서연이는 늘 그렇듯 과장 없이 들어줬다.',
    emotion: 'warm',
    people: ['김서연'],
  },
}

export const WithoutPeople: Story = {
  args: {
    date: '2026년 7월 26일 · 일',
    title: '혼자 간 서점',
    bodyPreview: '아무도 만나지 않았지만 기록해둔다. 조용한 오후였다.',
    emotion: 'calm',
  },
}

export const LongText: Story = {
  args: {
    date: '2026년 7월 25일 · 토',
    title: '제목이 아주 긴 기록 — 가족 모임에서 오간 이야기들이 길게 이어지는 경우의 줄바꿈 확인',
    bodyPreview:
      '본문 미리보기가 두 줄을 넘기면 줄임 처리되어야 한다. 이 텍스트는 그 경계를 확인하기 위해 의도적으로 길게 작성되었다. 세 번째 줄은 보이지 않아야 정상이다.',
    emotion: 'dear',
    people: ['김서연', '이하준', '한지민', '박도윤'],
  },
}

export const MobileWidth: Story = {
  args: {
    date: '2026년 7월 27일 · 월',
    title: '서연이와 한강 산책',
    bodyPreview: '퇴근하고 한강에서 만났다. 편의점 커피를 들고 걷다가 해가 지는 걸 끝까지 봤다.',
    emotion: 'warm',
    people: ['김서연'],
  },
  render: (args) => (
    <div className="w-[350px]">
      <DiaryEntryCard {...args} />
    </div>
  ),
}
