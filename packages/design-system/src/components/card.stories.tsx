import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from './card'
import { Button } from './button'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-80">
      <CardHeader>
        <CardTitle>오늘의 기록</CardTitle>
        <CardDescription>2026년 7월 27일 월요일</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          오늘은 공원에서 산책을 했다. 날씨가 좋아서 기분이 좋았다.
        </p>
      </CardContent>
      <CardFooter>
        <Button variant="ghost" size="sm">
          편집
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const Simple: Story = {
  render: () => (
    <Card className="w-80">
      <CardContent className="pt-4">
        <p className="text-sm">간단한 카드 내용</p>
      </CardContent>
    </Card>
  ),
}
