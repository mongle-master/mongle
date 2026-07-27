import { useState } from "react";
import { Home, Users, Clock, Settings } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";

import { TabBar } from "./tab-bar";

const meta: Meta<typeof TabBar> = {
  title: "Components/TabBar",
  component: TabBar,
};
export default meta;

type Story = StoryObj<typeof TabBar>;

const items = [
  { key: "home", label: "홈", icon: <Home /> },
  { key: "timeline", label: "몽글라인", icon: <Clock /> },
  { key: "people", label: "사람", icon: <Users /> },
  { key: "settings", label: "설정", icon: <Settings /> },
];

export const Default: Story = {
  render: () => {
    const [value, setValue] = useState("home");
    return <TabBar items={items} value={value} onValueChange={setValue} />;
  },
};
