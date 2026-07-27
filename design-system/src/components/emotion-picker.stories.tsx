import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import type { Emotion } from './emotions'
import { EmotionPicker } from './emotion-picker'

const meta = {
  title: 'Domain/EmotionPicker',
  component: EmotionPicker,
} satisfies Meta<typeof EmotionPicker>

export default meta
type Story = StoryObj<typeof meta>

function Stateful() {
  const [emotion, setEmotion] = useState<Emotion | null>(null)
  return <EmotionPicker value={emotion} onChange={setEmotion} />
}

export const Default: Story = {
  args: { value: null, onChange: () => {} },
  render: () => <Stateful />,
}

export const Preselected: Story = {
  args: { value: 'warm', onChange: () => {} },
  render: () => <EmotionPicker value="warm" onChange={() => {}} />,
}
