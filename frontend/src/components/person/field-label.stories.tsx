import type { Meta, StoryObj } from '@storybook/react-vite'
import { FieldLabel } from '@/components/person/field-label'

const meta = {
  title: 'Person/FieldLabel',
  component: FieldLabel,
  tags: ['autodocs'],
  args: {
    children: '만남 태그',
  },
} satisfies Meta<typeof FieldLabel>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {}
