import { Field } from '@/components/ui/field'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Field',
  component: Field,
  tags: ['autodocs'],
  args: {
    label: '종류',
    children: (
      <p className="text-body text-foreground/80">여기에 입력이 들어가요</p>
    ),
  },
  decorators: [
    (Story) => (
      <div className="mx-auto w-full max-w-md px-5">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof Field>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Stacked: Story = {
  render: () => (
    <div className="flex flex-col gap-7">
      <Field label="처음 만난 날">
        <p className="text-body text-foreground/80">2024년 3월 1일</p>
      </Field>
      <Field label="생일">
        <p className="text-body text-foreground/80">비워 두어도 돼요</p>
      </Field>
    </div>
  ),
}
