import { ListGroup } from '@/components/ui/list-group'
import { SettingsNavigationItem } from '@/components/settings/settings-navigation-item'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Settings/SettingsNavigationItem',
  component: SettingsNavigationItem,
  tags: ['autodocs'],
  args: {
    label: '알림 설정',
    onClick: () => {},
  },
  // 항목은 ListGroup(둥근 배경·구분선 컨텍스트) 안에서 쓰이므로 감싸서 실제 모습을 보여준다.
  decorators: [
    (Story) => (
      <div className="w-80">
        <ListGroup>
          <Story />
        </ListGroup>
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsNavigationItem>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutDivider: Story = {
  args: { withDivider: false },
}

export const LongText: Story = {
  args: { label: '오랜만에 연락한 사람에게 보낼 안부 리마인더 알림 설정' },
}
