import type { Meta, StoryObj } from '@storybook/react-vite'
import { useState } from 'react'

import { ThrowbackCard } from './throwback-card'

const meta = {
  title: 'Home/ThrowbackCard',
  component: ThrowbackCard,
  tags: ['autodocs'],
  args: {
    occurredDate: '2025.07.28',
    title: '서연이와 한강 산책',
    personName: '김서연',
    onOpen: () => {},
    onDismiss: () => {},
    onExitEnd: () => {},
  },
} satisfies Meta<typeof ThrowbackCard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithoutTitle: Story = {
  args: {
    title: null,
  },
}

export const Dismissible: Story = {
  render: (args) => {
    const [exiting, setExiting] = useState(false)
    const [gone, setGone] = useState(false)
    if (gone) {
      return (
        <p className="py-8 text-center text-label text-muted-foreground">
          카드가 닫혔습니다 (퇴장 전환 재생 후 언마운트).
        </p>
      )
    }
    return (
      <ThrowbackCard
        {...args}
        exiting={exiting}
        onDismiss={() => setExiting(true)}
        onExitEnd={() => setGone(true)}
      />
    )
  },
}
