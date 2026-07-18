import { Button } from '@/components/ui/button'
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
        'outline-foreground',
        'secondary',
        'ghost',
        'destructive',
        'destructive-solid',
        'link',
      ],
    },
    size: {
      control: 'select',
      options: ['default', 'xs', 'sm', 'lg', 'cta', 'pill', 'pill-sm', 'icon'],
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

export const Destructive: Story = {
  args: { variant: 'destructive' },
}

export const Small: Story = {
  args: { size: 'sm' },
}

// 이 앱의 pill 버튼 언어(rounded-full + font-extrabold) 스토리.
export const Cta: Story = {
  args: { size: 'cta', children: '저장' },
}

export const Pill: Story = {
  args: { size: 'pill', children: '다시 시도' },
}

export const PillSmall: Story = {
  args: { variant: 'outline', size: 'pill-sm', children: '필터 설정' },
}

export const OutlineForeground: Story = {
  args: { variant: 'outline-foreground', size: 'cta', children: '사람 추가' },
}

export const DestructiveSolid: Story = {
  args: { variant: 'destructive-solid', size: 'cta', children: '삭제' },
}
