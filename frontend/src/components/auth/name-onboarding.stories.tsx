import { NameOnboarding } from '@/components/auth/name-onboarding'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Auth/NameOnboarding',
  component: NameOnboarding,
  tags: ['autodocs'],
  args: {
    onSubmit: () => {},
  },
  // 컴포넌트가 부모 높이를 채우는 `h-full`/`my-auto` 레이아웃이라 프레임 높이를 준다.
  decorators: [
    (Story) => (
      <div className="mx-auto h-screen w-full max-w-md">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof NameOnboarding>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Pending: Story = {
  args: { pending: true },
}
