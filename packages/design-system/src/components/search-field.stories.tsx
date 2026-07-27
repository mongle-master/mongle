import type { Meta, StoryObj } from "@storybook/react";

import { SearchField } from "./search-field";

const meta: Meta<typeof SearchField> = {
  title: "Components/SearchField",
  component: SearchField,
  args: { placeholder: "검색" },
};
export default meta;

type Story = StoryObj<typeof SearchField>;

export const Default: Story = {
  decorators: [(Story) => <div className="w-80"><Story /></div>],
};
