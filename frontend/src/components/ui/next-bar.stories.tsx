import { NextBar } from '@/components/ui/next-bar'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/NextBar',
  component: NextBar,
  tags: ['autodocs'],
  args: {
    onNext: () => {},
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NextBar>

export default meta

type Story = StoryObj<typeof meta>

// record 퍼널: 전체 스크롤이라 CTA를 바닥에 sticky로 고정한다.
export const Sticky: Story = {
  args: {
    label: '이어서',
    sticky: true,
  },
}

// person-new 퍼널: 껍데기가 고정이라 sticky가 필요 없다.
export const Plain: Story = {
  args: {
    label: '다음',
  },
}

export const Disabled: Story = {
  args: {
    label: '다음',
    disabled: true,
  },
}
