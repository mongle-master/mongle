import { ChevronLeft, Plus } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { NavigationBar } from "./navigation-bar";

const meta: Meta<typeof NavigationBar> = {
  title: "Components/NavigationBar",
  component: NavigationBar,
};
export default meta;

type Story = StoryObj<typeof NavigationBar>;

export const WithTitle: Story = {
  args: {
    title: "기록",
    leading: (
      <Button variant="ghost" size="icon" aria-label="뒤로">
        <ChevronLeft />
      </Button>
    ),
  },
};

export const WithAction: Story = {
  args: {
    title: "사람",
    trailing: (
      <Button variant="ghost" size="icon" aria-label="추가">
        <Plus />
      </Button>
    ),
  },
};
