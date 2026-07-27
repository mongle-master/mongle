import type { Meta, StoryObj } from "@storybook/react";

import { DiaryEntry } from "./diary-entry";

const meta: Meta<typeof DiaryEntry> = {
  title: "Domain/DiaryEntry",
  component: DiaryEntry,
};
export default meta;

type Story = StoryObj<typeof DiaryEntry>;

export const Default: Story = {
  args: {
    title: "오랜만의 산책",
    date: "2026. 7. 28",
    emotion: "calm",
    excerpt:
      "저녁 먹고 한강변을 걸었다. 선선한 바람이 불어와서 이어폰 없이 그냥 걷기만 했는데, 그게 오히려 좋았다.",
  },
};

export const Handwritten: Story = {
  args: {
    title: "감사 일기",
    date: "2026. 7. 27",
    emotion: "gratitude",
    excerpt: "오늘도 무사히 하루를 마쳤다. 따뜻한 밥, 편안한 잠자리, 연락해준 친구.",
    isHandwritten: true,
  },
};

export const NoExcerpt: Story = {
  args: { title: "제목만 있는 기록", date: "2026. 7. 26" },
};

export const LongTitle: Story = {
  args: {
    title: "오늘은 정말 길고 복잡한 하루였다 — 아침부터 밤까지 일어난 모든 일들",
    date: "2026. 7. 25",
    emotion: "anger",
    excerpt: "아침 회의에서 시작된 스트레스가 퇴근 후에도 가시지 않았다.",
  },
};

export const List: Story = {
  render: () => (
    <div className="flex w-[380px] flex-col gap-3">
      <DiaryEntry title="월요일 아침" date="2026. 7. 28" emotion="joy" excerpt="새 주 시작. 커피가 맛있었다." />
      <DiaryEntry title="비 오는 오후" date="2026. 7. 27" emotion="sadness" excerpt="창밖을 보며 멍하니 있었다." />
      <DiaryEntry title="감사" date="2026. 7. 26" emotion="gratitude" />
    </div>
  ),
};
