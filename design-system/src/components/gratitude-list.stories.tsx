import type { Meta, StoryObj } from '@storybook/react-vite'

import { GratitudeList } from './gratitude-list'

const meta = {
  title: 'Domain/GratitudeList',
  component: GratitudeList,
} satisfies Meta<typeof GratitudeList>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: { items: ['해를 본 것'] },
  render: () => (
    <div className="w-full max-w-lg rounded-xl border border-border bg-card p-6">
      <p className="eyebrow mb-2">오늘의 감사 · 7월 27일</p>
      <GratitudeList
        items={[
          '아침에 늦잠을 자지 않고 해를 본 것',
          '서연이가 먼저 안부를 물어준 것',
          '저녁 산책 공기가 선선했던 것',
        ]}
      />
    </div>
  ),
}
