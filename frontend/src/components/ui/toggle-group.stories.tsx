import { ToggleGroup, ToggleGroupItem } from '@/components/ui/toggle-group'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/ToggleGroup',
  component: ToggleGroup,
  tags: ['autodocs'],
  args: {
    type: 'single',
  },
} satisfies Meta<typeof ToggleGroup>

export default meta

type Story = StoryObj<typeof meta>

export const SingleDefault: Story = {
  render: () => (
    <ToggleGroup type="single" defaultValue="전체">
      <ToggleGroupItem value="전체">전체</ToggleGroupItem>
      <ToggleGroupItem value="가족">가족</ToggleGroupItem>
      <ToggleGroupItem value="친구">친구</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const MultipleOutline: Story = {
  render: () => (
    <ToggleGroup type="multiple" variant="outline" defaultValue={['가족']}>
      <ToggleGroupItem value="가족">가족</ToggleGroupItem>
      <ToggleGroupItem value="친구">친구</ToggleGroupItem>
      <ToggleGroupItem value="동료">동료</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Vertical: Story = {
  render: () => (
    <ToggleGroup type="single" orientation="vertical" defaultValue="가족">
      <ToggleGroupItem value="가족">가족</ToggleGroupItem>
      <ToggleGroupItem value="친구">친구</ToggleGroupItem>
      <ToggleGroupItem value="동료">동료</ToggleGroupItem>
    </ToggleGroup>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div className="flex flex-col items-start gap-3">
      <ToggleGroup type="single" size="sm" defaultValue="가족">
        <ToggleGroupItem value="가족">가족</ToggleGroupItem>
        <ToggleGroupItem value="친구">친구</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="default" defaultValue="가족">
        <ToggleGroupItem value="가족">가족</ToggleGroupItem>
        <ToggleGroupItem value="친구">친구</ToggleGroupItem>
      </ToggleGroup>
      <ToggleGroup type="single" size="lg" defaultValue="가족">
        <ToggleGroupItem value="가족">가족</ToggleGroupItem>
        <ToggleGroupItem value="친구">친구</ToggleGroupItem>
      </ToggleGroup>
    </div>
  ),
}
