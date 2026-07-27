import type { Meta, StoryObj } from '@storybook/react-vite'

import { Badge } from './badge'
import { EMOTIONS, EMOTION_LABELS } from './emotions'

const meta = {
  title: 'Core/Badge',
  component: Badge,
} satisfies Meta<typeof Badge>

export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      <Badge>가족</Badge>
      <Badge variant="outline">친구</Badge>
      <Badge variant="success">저장됨</Badge>
      <Badge variant="warning">비공개</Badge>
      <Badge variant="destructive">삭제됨</Badge>
    </div>
  ),
}

export const Emotions: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-3">
      {EMOTIONS.map((emotion) => (
        <Badge key={emotion} emotion={emotion}>
          {EMOTION_LABELS[emotion]}
        </Badge>
      ))}
    </div>
  ),
}
