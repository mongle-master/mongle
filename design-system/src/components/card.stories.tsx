import type { Meta, StoryObj } from '@storybook/react-vite'

import { Button } from './button'
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from './card'

const meta = {
  title: 'Core/Card',
  component: Card,
} satisfies Meta<typeof Card>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Card className="w-96">
      <CardHeader>
        <CardTitle>프로필 설정</CardTitle>
        <CardDescription>이름과 사진을 등록하면 관계 지도에 표시됩니다.</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-body-sm text-body">카드 본문은 본문 글자색(--body)을 사용합니다.</p>
      </CardContent>
      <CardFooter className="gap-2">
        <Button>저장</Button>
        <Button variant="ghost">취소</Button>
      </CardFooter>
    </Card>
  ),
}
