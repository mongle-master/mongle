import { ProfileOnboarding } from '@/components/auth/profile-onboarding'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Auth/ProfileOnboarding',
  component: ProfileOnboarding,
  tags: ['autodocs'],
  args: {
    username: '김민수',
    onComplete: async () => {},
  },
  // 컴포넌트가 부모 높이를 채우는 `h-full` 레이아웃이라 프레임 높이를 준다.
  decorators: [
    (Story) => (
      <div className="mx-auto h-screen w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof ProfileOnboarding>

export default meta

type Story = StoryObj<typeof meta>

export const DefaultFemale: Story = {}

export const WithBackButton: Story = {
  args: { onBack: () => {} },
}
