import type { Meta, StoryObj } from "@storybook/react";

import { Input, Textarea } from "./input";

const meta: Meta<typeof Input> = {
  title: "Components/Input",
  component: Input,
};
export default meta;

type Story = StoryObj<typeof Input>;

export const Default: Story = { args: { placeholder: "제목을 입력하세요" } };

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-1.5">
      <label className="text-sm font-medium" htmlFor="title">
        제목
      </label>
      <Input id="title" placeholder="오늘의 제목" />
    </div>
  ),
};

export const Disabled: Story = {
  args: { disabled: true, value: "수정 불가", readOnly: true },
};

export const DiaryTextarea: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-1.5">
      <label className="text-sm font-medium" htmlFor="diary">
        오늘의 기록
      </label>
      <Textarea
        id="diary"
        className="letter-paper font-hand min-h-[160px] text-base leading-7"
        placeholder="오늘 하루는 어땠나요?"
      />
    </div>
  ),
};
