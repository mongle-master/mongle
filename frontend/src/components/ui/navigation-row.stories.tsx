import { ListGroup } from '@/components/ui/list-group'
import { NavigationRow } from '@/components/ui/navigation-row'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/NavigationRow',
  component: NavigationRow,
  tags: ['autodocs'],
  args: {
    label: '프로필 수정',
    onClick: () => {},
  },
  // 행은 ListGroup(둥근 배경·구분선 컨텍스트) 안에서 쓰이므로 감싸서 실제 모습을 보여준다.
  decorators: [
    (Story) => (
      <div className="w-80">
        <ListGroup>
          <Story />
        </ListGroup>
      </div>
    ),
  ],
} satisfies Meta<typeof NavigationRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Destructive: Story = {
  args: { label: '인물 삭제', tone: 'destructive', withDivider: false },
}

export const WithoutDivider: Story = {
  args: { withDivider: false },
}

export const Disabled: Story = {
  args: { label: '인물 삭제', tone: 'destructive', disabled: true },
}

export const LongText: Story = {
  args: {
    label: '오랜만에 연락한 사람에게 보낼 안부 리마인더를 지금 설정하기',
  },
}
