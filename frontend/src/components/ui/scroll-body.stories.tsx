import { ScrollBody } from '@/components/ui/scroll-body'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ScrollBody',
  component: ScrollBody,
  tags: ['autodocs'],
  argTypes: {
    pad: {
      control: 'select',
      options: ['tabbar', 'screen', 'none'],
    },
  },
  // flex-1 본문이라, 높이가 정해진 세로 flex 컨테이너 안에서만 스크롤이 드러난다.
  decorators: [
    (Story) => (
      <div className="flex h-96 w-72 flex-col overflow-hidden rounded-xl border border-border">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ScrollBody>

export default meta

type Story = StoryObj<typeof meta>

const LINES = Array.from(
  { length: 24 },
  (_, i) => `${i + 1}번째 줄 · 스크롤을 확인하기 위한 긴 본문 내용이에요.`,
)

function Filler() {
  return (
    <div className="space-y-3 px-4 py-3">
      {LINES.map((line) => (
        <p key={line} className="text-sm text-foreground">
          {line}
        </p>
      ))}
    </div>
  )
}

// 탭바가 겹치는 탭 화면. 하단 pb-24로 마지막 항목이 탭바에 가리지 않게 한다.
export const Tabbar: Story = {
  args: { pad: 'tabbar' },
  render: (args) => (
    <ScrollBody {...args}>
      <Filler />
    </ScrollBody>
  ),
}

// 일반 전체 화면. 하단 pb-8 여백만 둔다.
export const Screen: Story = {
  args: { pad: 'screen' },
  render: (args) => (
    <ScrollBody {...args}>
      <Filler />
    </ScrollBody>
  ),
}

// 하단 여백 없이 콘텐츠 끝까지. 하단에 별도 고정 바가 붙는 화면에 쓴다.
export const None: Story = {
  args: { pad: 'none' },
  render: (args) => (
    <ScrollBody {...args}>
      <Filler />
    </ScrollBody>
  ),
}
