import type { Meta, StoryObj } from "@storybook/react";

import { PersonCard } from "./person-card";

const meta: Meta<typeof PersonCard> = {
  title: "Domain/PersonCard",
  component: PersonCard,
};
export default meta;

type Story = StoryObj<typeof PersonCard>;

export const Default: Story = {
  args: { name: "김서연", relation: "대학 친구", lastRecord: "3일 전" },
};

export const WithoutRelation: Story = {
  args: { name: "이준호", lastRecord: "오늘" },
};

export const LongName: Story = {
  args: { name: "알렉산드라 콘스탄티노풀로스", relation: "어학원 동기", lastRecord: "2주 전" },
};

export const List: Story = {
  render: () => (
    <div className="flex w-[340px] flex-col gap-2">
      <PersonCard name="김서연" relation="대학 친구" lastRecord="3일 전" />
      <PersonCard name="박민수" relation="회사 동료" lastRecord="어제" />
      <PersonCard name="엄마" relation="가족" lastRecord="오늘" />
      <PersonCard name="이준호" relation="고등학교 동기" lastRecord="1주 전" />
    </div>
  ),
};
