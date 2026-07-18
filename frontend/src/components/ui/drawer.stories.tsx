import { Button } from '@/components/ui/button'
import {
  Drawer,
  DrawerClose,
  DrawerContent,
  DrawerDescription,
  DrawerFooter,
  DrawerHeader,
  DrawerTitle,
  DrawerTrigger,
} from '@/components/ui/drawer'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Drawer',
  component: Drawer,
  tags: ['autodocs'],
  args: {
    defaultOpen: true,
  },
  render: (args) => (
    <Drawer {...args}>
      <DrawerTrigger asChild>
        <Button type="button" variant="outline">
          필터 설정 열기
        </Button>
      </DrawerTrigger>
      <DrawerContent className="mx-auto w-full max-w-md">
        <DrawerHeader>
          <DrawerTitle>필터 설정</DrawerTitle>
          <DrawerDescription>보고 싶은 기록만 골라보세요.</DrawerDescription>
        </DrawerHeader>
        <div className="px-4 pb-2 text-sm text-muted-foreground">
          가족 · 친구 · 직장 카테고리를 선택할 수 있어요.
        </div>
        <DrawerFooter>
          <DrawerClose asChild>
            <Button type="button" className="rounded-full font-extrabold">
              완료
            </Button>
          </DrawerClose>
        </DrawerFooter>
      </DrawerContent>
    </Drawer>
  ),
} satisfies Meta<typeof Drawer>

export default meta

type Story = StoryObj<typeof meta>

export const Bottom: Story = {
  args: { direction: 'bottom' },
}

export const Top: Story = {
  args: { direction: 'top' },
}

export const Left: Story = {
  args: { direction: 'left' },
}

export const Right: Story = {
  args: { direction: 'right' },
}
