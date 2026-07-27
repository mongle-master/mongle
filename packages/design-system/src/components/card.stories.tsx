import type { Meta, StoryObj } from "@storybook/react";

import { Button } from "./button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "./card";

const meta: Meta<typeof Card> = {
  title: "Components/Card",
  component: Card,
};
export default meta;

type Story = StoryObj<typeof Card>;

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>오늘의 기록</CardTitle>
        <CardDescription>2026년 7월 28일 화요일</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          오늘은 오랜만에 산책을 나갔다. 저녁 공기가 선선해서 기분이 좋았다.
        </p>
      </CardContent>
      <CardFooter>
        <Button size="sm" variant="secondary">
          편집
        </Button>
      </CardFooter>
    </Card>
  ),
};

export const Minimal: Story = {
  render: () => (
    <Card className="w-80 p-4">
      <p className="text-sm">간단한 메모 카드</p>
    </Card>
  ),
};
