import { Bell, Moon, Tag } from "lucide-react";
import type { Meta, StoryObj } from "@storybook/react";

import { GroupedList, ListRow } from "./list-row";
import { Switch } from "./switch";
import { useState } from "react";

const meta: Meta<typeof ListRow> = {
  title: "Components/ListRow",
  component: ListRow,
};
export default meta;

type Story = StoryObj<typeof ListRow>;

export const Single: Story = {
  args: { title: "관계 태그", trailing: "5개", chevron: true, withDivider: false },
};

export const Grouped: Story = {
  render: () => {
    const [dark, setDark] = useState(false);
    return (
      <GroupedList className="w-80">
        <ListRow
          leading={<Moon className="size-5 text-primary" />}
          title="다크 모드"
          trailing={<Switch checked={dark} onCheckedChange={setDark} aria-label="다크 모드" />}
        />
        <ListRow leading={<Tag className="size-5 text-primary" />} title="관계 태그" trailing="5개" chevron />
        <ListRow leading={<Bell className="size-5 text-primary" />} title="알림" chevron withDivider={false} />
      </GroupedList>
    );
  },
};
