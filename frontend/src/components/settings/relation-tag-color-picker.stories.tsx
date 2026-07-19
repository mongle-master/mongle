import { RelationTagColorPicker } from '@/components/settings/relation-tag-color-picker'
import { RELATION_TAG_COLOR_OPTIONS } from '@/lib/relation-tag-colors'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Settings/RelationTagColorPicker',
  component: RelationTagColorPicker,
  tags: ['autodocs'],
  args: {
    value: RELATION_TAG_COLOR_OPTIONS[0].value,
    onChange: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-72">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof RelationTagColorPicker>

export default meta

type Story = StoryObj<typeof meta>

// 버튼을 눌러 색상 모달을 여는 상호작용은 TagColorPickerModal 스토리에서 다룬다.
// 여기서는 트리거 버튼의 기본 모습(선택된 색 라벨 표시)만 보여준다.
export const Default: Story = {}
