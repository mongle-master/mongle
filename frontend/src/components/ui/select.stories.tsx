import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Select',
  component: Select,
  tags: ['autodocs'],
} satisfies Meta<typeof Select>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Select defaultValue="friend">
      <SelectTrigger>
        <SelectValue placeholder="관계 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="family">가족</SelectItem>
        <SelectItem value="friend">친구</SelectItem>
        <SelectItem value="work">직장</SelectItem>
        <SelectItem value="acquaintance">지인</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const Grouped: Story = {
  render: () => (
    <Select defaultValue="mom">
      <SelectTrigger>
        <SelectValue placeholder="사람 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>가족</SelectLabel>
          <SelectItem value="mom">엄마</SelectItem>
          <SelectItem value="dad">아빠</SelectItem>
        </SelectGroup>
        <SelectGroup>
          <SelectLabel>친구</SelectLabel>
          <SelectItem value="minsu">김민수</SelectItem>
          <SelectItem value="jiwoo">이지우</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const WithSeparator: Story = {
  render: () => (
    <Select defaultValue="mom">
      <SelectTrigger>
        <SelectValue placeholder="사람 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectGroup>
          <SelectLabel>가족</SelectLabel>
          <SelectItem value="mom">엄마</SelectItem>
          <SelectItem value="dad">아빠</SelectItem>
        </SelectGroup>
        <SelectSeparator />
        <SelectGroup>
          <SelectLabel>직장</SelectLabel>
          <SelectItem value="team-lead">박팀장</SelectItem>
          <SelectItem value="minsu">김민수</SelectItem>
        </SelectGroup>
      </SelectContent>
    </Select>
  ),
}

export const Placeholder: Story = {
  render: () => (
    <Select>
      <SelectTrigger>
        <SelectValue placeholder="관계를 선택하세요" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="family">가족</SelectItem>
        <SelectItem value="friend">친구</SelectItem>
        <SelectItem value="work">직장</SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const DisabledItem: Story = {
  render: () => (
    <Select defaultValue="family">
      <SelectTrigger>
        <SelectValue placeholder="관계 선택" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="family">가족</SelectItem>
        <SelectItem value="friend">친구</SelectItem>
        <SelectItem value="work" disabled>
          직장 (준비 중)
        </SelectItem>
      </SelectContent>
    </Select>
  ),
}

export const SmallSize: Story = {
  render: () => (
    <Select defaultValue="09">
      <SelectTrigger size="sm">
        <SelectValue placeholder="시" />
      </SelectTrigger>
      <SelectContent>
        <SelectItem value="09">09</SelectItem>
        <SelectItem value="10">10</SelectItem>
        <SelectItem value="11">11</SelectItem>
        <SelectItem value="12">12</SelectItem>
      </SelectContent>
    </Select>
  ),
}
