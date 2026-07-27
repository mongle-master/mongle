import type { Meta, StoryObj } from "@storybook/react";
import { useState } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "./tabs";

const meta: Meta<typeof Tabs> = {
  title: "Components/Tabs",
  component: Tabs,
};
export default meta;

type Story = StoryObj<typeof Tabs>;

export const Default: Story = {
  render: () => {
    const [tab, setTab] = useState("diary");
    return (
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="diary">일기</TabsTrigger>
          <TabsTrigger value="emotion">감정</TabsTrigger>
          <TabsTrigger value="people">주변인</TabsTrigger>
        </TabsList>
        <TabsContent value="diary">
          <p className="text-sm text-muted-foreground">일기 목록이 여기에 표시됩니다.</p>
        </TabsContent>
        <TabsContent value="emotion">
          <p className="text-sm text-muted-foreground">감정 추이가 여기에 표시됩니다.</p>
        </TabsContent>
        <TabsContent value="people">
          <p className="text-sm text-muted-foreground">주변인 목록이 여기에 표시됩니다.</p>
        </TabsContent>
      </Tabs>
    );
  },
};
