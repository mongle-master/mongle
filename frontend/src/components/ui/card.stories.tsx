import { Button } from '@/components/ui/button'
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Card',
  component: Card,
  tags: ['autodocs'],
  argTypes: {
    size: {
      control: 'select',
      options: ['default', 'sm'],
    },
  },
} satisfies Meta<typeof Card>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>김민수</CardTitle>
        <CardDescription>대학 동기 · 3년째 인연</CardDescription>
      </CardHeader>
      <CardContent>오랜만에 만났다. 요즘 이직 준비 중이라고 했다.</CardContent>
    </Card>
  ),
}

export const WithFooter: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>엄마 생신</CardTitle>
        <CardDescription>다음 주 토요일 저녁 약속</CardDescription>
      </CardHeader>
      <CardContent>선물은 목도리로 준비하기로 했다.</CardContent>
      <CardFooter>
        <Button variant="secondary" size="sm">
          일정 열기
        </Button>
      </CardFooter>
    </Card>
  ),
}

export const WithAction: Story = {
  render: (args) => (
    <Card {...args} className="w-80">
      <CardHeader>
        <CardTitle>이서연</CardTitle>
        <CardDescription>회사 동료</CardDescription>
        <CardAction>
          <Button variant="ghost" size="sm">
            수정
          </Button>
        </CardAction>
      </CardHeader>
      <CardContent>지난달 프로젝트를 함께 마무리했다.</CardContent>
    </Card>
  ),
}

export const SmallSize: Story = {
  args: { size: 'sm' },
  render: (args) => (
    <Card {...args} className="w-72">
      <CardHeader>
        <CardTitle>박지훈</CardTitle>
        <CardDescription>동네 카페 사장님</CardDescription>
      </CardHeader>
      <CardContent>단골이 된 지 벌써 반년째다.</CardContent>
    </Card>
  ),
}
