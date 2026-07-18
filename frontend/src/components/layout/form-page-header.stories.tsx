import { FormPageHeader } from '@/components/layout/form-page-header'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Layout/FormPageHeader',
  component: FormPageHeader,
  tags: ['autodocs'],
  args: {
    title: '프로필 수정',
    onBack: () => {},
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-md px-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof FormPageHeader>

export default meta

type Story = StoryObj<typeof meta>

export const WithSave: Story = {
  args: {
    onSave: () => {},
  },
}

export const WithoutSave: Story = {}

export const Saving: Story = {
  args: {
    onSave: () => {},
    saving: true,
  },
}

export const Disabled: Story = {
  args: {
    onSave: () => {},
    disabled: true,
  },
}

export const LongTitle: Story = {
  args: {
    title: '새로운 사람 기록하고 관계 시작하기',
    onSave: () => {},
  },
}
