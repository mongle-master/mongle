import type { Meta, StoryObj } from "@storybook/react";

import { Badge } from "./badge";

const meta: Meta<typeof Badge> = {
  title: "Components/Badge",
  component: Badge,
};
export default meta;

type Story = StoryObj<typeof Badge>;

export const Default: Story = { args: { children: "기본" } };
export const Primary: Story = { args: { variant: "primary", children: "활성" } };
export const Destructive: Story = { args: { variant: "destructive", children: "위험" } };
export const Outline: Story = { args: { variant: "outline", children: "테두리" } };

export const Emotions: Story = {
  render: () => (
    <div className="flex flex-wrap gap-2">
      <Badge variant="joy">☀️ 기쁨</Badge>
      <Badge variant="calm">🌊 평온</Badge>
      <Badge variant="sadness">🌧️ 슬픔</Badge>
      <Badge variant="anger">🔥 분노</Badge>
      <Badge variant="gratitude">🌱 감사</Badge>
    </div>
  ),
};
