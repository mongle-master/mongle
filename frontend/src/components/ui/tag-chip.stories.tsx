import { TagChip } from '@/components/ui/tag-chip'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/TagChip',
  component: TagChip,
  tags: ['autodocs'],
  args: {
    children: '대학교',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['xs', 'sm', 'default', 'lg', 'xl'],
    },
    surface: {
      control: 'select',
      options: ['card', 'card-muted', 'background', 'soft', 'outline', 'plain'],
    },
    tone: {
      control: 'select',
      options: ['primary', 'foreground', 'colored'],
    },
    hover: { control: 'boolean' },
    selected: { control: 'boolean' },
    interactive: { control: 'boolean' },
  },
} satisfies Meta<typeof TagChip>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Selected: Story = {
  args: { tone: 'foreground', selected: true },
}

// 높이 4단계(+아바타 필터용 xl)를 한눈에.
export const Sizes: Story = {
  render: (args) => (
    <div className="flex flex-wrap items-center gap-2">
      <TagChip {...args} size="xs">
        아주 작게
      </TagChip>
      <TagChip {...args} size="sm">
        작게
      </TagChip>
      <TagChip {...args} size="default">
        기본
      </TagChip>
      <TagChip {...args} size="lg">
        크게
      </TagChip>
    </div>
  ),
}

// 선택 시 채움색: primary / foreground 반전.
export const Tones: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <TagChip tone="primary" selected>
        primary
      </TagChip>
      <TagChip tone="foreground" selected>
        foreground
      </TagChip>
      <TagChip tone="primary">비선택</TagChip>
    </div>
  ),
}

// 쉬는 상태(비선택) 표면.
export const Surfaces: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <TagChip surface="card">card</TagChip>
      <TagChip surface="card-muted">card-muted</TagChip>
      <TagChip surface="background">background</TagChip>
      <TagChip surface="soft">soft</TagChip>
      <TagChip surface="outline">outline</TagChip>
    </div>
  ),
}

// 태그 지정색: color prop이 coloredTagStyle을 내부에서 주입한다.
export const Colored: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <TagChip color="#2563EB">블루</TagChip>
      <TagChip color="#22A06B">그린</TagChip>
      <TagChip color="#DB2777" selected>
        핑크(선택)
      </TagChip>
    </div>
  ),
}

// 표시 전용(span): aria-pressed·버튼 시맨틱 없음.
export const Display: Story = {
  args: {
    interactive: false,
    surface: 'soft',
    children: '표시 전용',
  },
}
