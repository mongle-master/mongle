import { Button } from './button'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Button',
  component: Button,
  tags: ['autodocs'],
  args: {
    children: '버튼',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: [
        'default',
        'outline',
        'secondary',
        'ghost',
        'destructive',
        'destructive-solid',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'sm', 'lg', 'cta', 'pill', 'icon', 'icon-sm'],
    },
  },
} satisfies Meta<typeof Button>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Outline: Story = {
  args: { variant: 'outline' },
}

export const Secondary: Story = {
  args: { variant: 'secondary' },
}

export const Ghost: Story = {
  args: { variant: 'ghost' },
}

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const DestructiveSolid: Story = {
  args: { variant: 'destructive-solid', children: '삭제' },
}

export const Cta: Story = {
  args: { size: 'cta', children: '기록 저장' },
}

export const Pill: Story = {
  args: { size: 'pill', children: '다시 시도' },
}

export const AllVariants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Button>기본</Button>
      <Button variant="outline">테두리</Button>
      <Button variant="secondary">보조</Button>
      <Button variant="ghost">고스트</Button>
      <Button variant="destructive">파괴</Button>
      <Button variant="destructive-solid">삭제</Button>
      <Button variant="link">링크</Button>
    </div>
  ),
}
