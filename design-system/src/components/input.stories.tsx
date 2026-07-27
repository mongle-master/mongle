import type { Meta, StoryObj } from '@storybook/react-vite'

import { Input } from './input'
import { Label } from './label'

const meta = {
  title: 'Core/Input',
  component: Input,
} satisfies Meta<typeof Input>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    placeholder: '이름을 입력하세요',
  },
}

export const WithLabel: Story = {
  render: () => (
    <div className="flex w-80 flex-col gap-2">
      <Label htmlFor="person-name">사람 이름</Label>
      <Input id="person-name" placeholder="누구를 만났나요?" />
    </div>
  ),
}

export const Disabled: Story = {
  args: {
    disabled: true,
    value: '수정할 수 없는 항목',
  },
}
