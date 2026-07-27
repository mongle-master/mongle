import type { Meta, StoryObj } from '@storybook/react-vite'

import { Textarea } from './textarea'

const meta = {
  title: 'Core/Textarea',
  component: Textarea,
} satisfies Meta<typeof Textarea>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    rows: 4,
    placeholder: '오늘의 기록을 남겨보세요',
  },
}

export const Letter: Story = {
  render: () => (
    <div className="w-full max-w-lg rounded-xl border border-border p-4">
      <Textarea
        variant="letter"
        rows={6}
        defaultValue={'오랜 친구를 만났다.\n커피잔을 사이에 두고\n세 시간이나 떠들었다.'}
        aria-label="편지지 기록"
      />
    </div>
  ),
}
