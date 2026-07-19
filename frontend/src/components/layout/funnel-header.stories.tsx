import { FunnelHeader } from '@/components/layout/funnel-header'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Layout/FunnelHeader',
  component: FunnelHeader,
  tags: ['autodocs'],
  args: {
    centerLabel: '김뭉클님',
    onBack: () => {},
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FunnelHeader>

export default meta

type Story = StoryObj<typeof meta>

export const WithSave: Story = {
  args: {
    onSave: () => {},
  },
}

// 저장 버튼이 없으면 우측은 자리만 차지하는 빈 칸(size-9)으로 정렬을 지킨다.
export const WithoutSave: Story = {}

export const Saving: Story = {
  args: {
    onSave: () => {},
    saving: true,
  },
}
