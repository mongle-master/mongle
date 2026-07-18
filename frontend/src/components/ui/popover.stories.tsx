import { Button } from '@/components/ui/button'
import {
  Popover,
  PopoverContent,
  PopoverDescription,
  PopoverHeader,
  PopoverTitle,
  PopoverTrigger,
} from '@/components/ui/popover'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Popover',
  component: Popover,
  tags: ['autodocs'],
} satisfies Meta<typeof Popover>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          옵션 열기
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <p>이 기록을 타임라인 맨 위에 고정할까요?</p>
      </PopoverContent>
    </Popover>
  ),
}

export const WithHeaderAndDescription: Story = {
  render: () => (
    <Popover defaultOpen>
      <PopoverTrigger asChild>
        <Button type="button" variant="outline">
          알림 설정
        </Button>
      </PopoverTrigger>
      <PopoverContent>
        <PopoverHeader>
          <PopoverTitle>알림 받기</PopoverTitle>
          <PopoverDescription>
            새로운 기록이 등록되면 알려드려요.
          </PopoverDescription>
        </PopoverHeader>
      </PopoverContent>
    </Popover>
  ),
}
