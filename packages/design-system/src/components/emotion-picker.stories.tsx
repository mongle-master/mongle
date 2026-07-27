import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { EmotionPicker, type Emotion } from "./emotion-picker";

const meta: Meta<typeof EmotionPicker> = {
  title: "Domain/EmotionPicker",
  component: EmotionPicker,
};
export default meta;

type Story = StoryObj<typeof EmotionPicker>;

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState<Emotion | null>(null);
    return <EmotionPicker value={value} onChange={setValue} />;
  },
};

export const WithSelection: Story = {
  render: () => {
    const [value, setValue] = useState<Emotion | null>("calm");
    return <EmotionPicker value={value} onChange={setValue} />;
  },
};

export const MobileWidth: Story = {
  render: () => {
    const [value, setValue] = useState<Emotion | null>("joy");
    return (
      <div className="w-[320px] rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm text-muted-foreground">오늘의 기분은?</p>
        <EmotionPicker value={value} onChange={setValue} />
      </div>
    );
  },
};
