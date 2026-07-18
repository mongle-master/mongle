import { PageTitle } from '@/components/ui/page-title'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/PageTitle',
  component: PageTitle,
  tags: ['autodocs'],
  args: {
    children: '나의 몽글라인',
  },
} satisfies Meta<typeof PageTitle>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

// 줄바꿈이 들어간 홈 탭 제목처럼 여러 줄도 leading-tight로 붙는다.
export const MultiLine: Story = {
  render: () => (
    <PageTitle>
      함께한 순간, <br /> 몽글몽글 쌓이는 중
    </PageTitle>
  ),
}

// className은 여백 등 레이아웃 전용이며 타이포는 컴포넌트가 고정한다.
export const WithLayoutClassName: Story = {
  args: {
    className: 'mb-4',
    children: '설정',
  },
}
