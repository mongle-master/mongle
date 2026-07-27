import { useState } from "react";
import type { Meta, StoryObj } from "@storybook/react";

import { Switch } from "./switch";

const meta: Meta<typeof Switch> = {
  title: "Components/Switch",
  component: Switch,
};
export default meta;

type Story = StoryObj<typeof Switch>;

export const Default: Story = {
  render: () => {
    const [checked, setChecked] = useState(true);
    return <Switch checked={checked} onCheckedChange={setChecked} aria-label="예시 스위치" />;
  },
};

export const Off: Story = {
  render: () => {
    const [checked, setChecked] = useState(false);
    return <Switch checked={checked} onCheckedChange={setChecked} aria-label="예시 스위치" />;
  },
};

export const Disabled: Story = {
  args: { checked: true, disabled: true, onCheckedChange: () => {} },
};
