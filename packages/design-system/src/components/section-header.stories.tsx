import type { Meta, StoryObj } from "@storybook/react";

import { SectionHeader } from "./section-header";

const meta: Meta<typeof SectionHeader> = {
  title: "Components/SectionHeader",
  component: SectionHeader,
  args: {
    eyebrow: "Design Language",
    title: "함께한 순간",
    description: "콘텐츠가 주인공이고 크롬은 조용히 물러난다.",
  },
};
export default meta;

type Story = StoryObj<typeof SectionHeader>;

export const Leading: Story = {};

export const Center: Story = {
  args: { align: "center" },
};
