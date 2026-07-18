import { SettingsPageHeader } from '@/components/settings/settings-page-header'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Settings/SettingsPageHeader',
  component: SettingsPageHeader,
  tags: ['autodocs'],
  args: {
    title: '설정',
    onBack: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-80 p-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof SettingsPageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const LongText: Story = {
  args: { title: '개인정보 처리방침 및 서비스 이용약관 안내' },
}
