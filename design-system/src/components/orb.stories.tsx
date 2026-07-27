import type { Meta, StoryObj } from '@storybook/react-vite'

import { EMOTIONS, EMOTION_LABELS } from './emotions'
import { Orb } from './orb'

const meta = {
  title: 'Domain/Orb',
  component: Orb,
} satisfies Meta<typeof Orb>

export default meta
type Story = StoryObj<typeof meta>

export const FiveFamilies: Story = {
  render: () => (
    <div className="flex flex-wrap gap-8">
      {EMOTIONS.map((emotion) => (
        <div key={emotion} className="flex flex-col items-center gap-3">
          <div className="relative size-28 overflow-hidden rounded-full bg-card">
            <Orb emotion={emotion} size={112} className="top-0 left-0" />
          </div>
          <span className="text-caption text-muted-foreground">{EMOTION_LABELS[emotion]}</span>
        </div>
      ))}
    </div>
  ),
}

export const Atmospheric: Story = {
  render: () => (
    <div className="relative flex h-64 w-full items-center justify-center overflow-hidden rounded-2xl bg-background">
      <Orb emotion="muse" size={260} animated className="-top-20 left-1/4" />
      <Orb emotion="warm" size={200} animated className="-right-10 -bottom-16" />
      <p className="relative font-display text-display-lg font-normal">오늘은 어떤 하루였나요?</p>
    </div>
  ),
}
