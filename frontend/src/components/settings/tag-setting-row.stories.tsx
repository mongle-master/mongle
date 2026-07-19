import { TagSettingRow } from '@/components/settings/tag-setting-row'
import type { ChipResponse } from '@/apis/generated/mongle-api.schemas'
import type { Meta, StoryObj } from '@storybook/react-vite'

const relationChip: ChipResponse = {
  id: 1,
  type: 'RELATION_TAG',
  label: '대학 동기',
  color: '#f97316',
  personal: true,
  order: 0,
  default: false,
}

const meta = {
  title: 'Settings/TagSettingRow',
  component: TagSettingRow,
  tags: ['autodocs'],
  args: {
    chip: relationChip,
    supportsColor: true,
    deletePending: false,
    onEdit: () => {},
    onDelete: () => {},
  },
  decorators: [
    (Story) => (
      <div className="w-80">
        <Story />
      </div>
    ),
  ],
} satisfies Meta<typeof TagSettingRow>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutColor: Story = {
  args: {
    chip: { ...relationChip, label: '가족', color: null },
    supportsColor: false,
  },
}

export const DeletePending: Story = {
  args: { deletePending: true },
}

export const LongLabel: Story = {
  args: {
    chip: { ...relationChip, label: '아주 오래 알고 지낸 초등학교 동창 친구' },
  },
}
