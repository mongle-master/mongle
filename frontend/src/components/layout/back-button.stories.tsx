import { BackButton } from '@/components/layout/back-button'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Layout/BackButton',
  component: BackButton,
  tags: ['autodocs'],
  args: {
    onClick: () => {},
  },
} satisfies Meta<typeof BackButton>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

// 여백은 호출부 className으로만 준다(컴포넌트 내부 분기 없음).
export const WithMargin: Story = {
  args: { className: '-ml-2' },
}

// aria-label 기본값("뒤로 가기")을 문맥에 맞게 덮어쓸 수 있다.
export const CustomAriaLabel: Story = {
  args: { 'aria-label': '이름 다시 정하기' },
}
