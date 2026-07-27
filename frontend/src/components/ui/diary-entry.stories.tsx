import {
  DiaryEntry,
  DiaryEntryHeader,
  DiaryEntryDate,
  DiaryEntryBody,
  DiaryEntryFooter,
} from '@/components/ui/diary-entry'
import { EmotionBadge } from '@/components/ui/emotion-badge'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/DiaryEntry',
  component: DiaryEntry,
  tags: ['autodocs'],
} satisfies Meta<typeof DiaryEntry>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <DiaryEntry className="max-w-md">
      <DiaryEntryHeader>
        <DiaryEntryDate dateTime="2026-07-27">
          2026년 7월 27일 월요일
        </DiaryEntryDate>
        <EmotionBadge emotion="joy" />
      </DiaryEntryHeader>
      <DiaryEntryBody>
        오늘은 공원에서 산책을 했다. 날씨가 좋아서 기분이 좋았다. 벤치에 앉아
        책을 읽다가 옆에 앉은 할머니와 대화를 나눴다. 그 웃음이 오래 기억에 남을
        것 같다.
      </DiaryEntryBody>
      <DiaryEntryFooter>
        <EmotionBadge emotion="gratitude" />
        <EmotionBadge emotion="calm" />
      </DiaryEntryFooter>
    </DiaryEntry>
  ),
}

export const ShortEntry: Story = {
  render: () => (
    <DiaryEntry className="max-w-md">
      <DiaryEntryHeader>
        <DiaryEntryDate dateTime="2026-07-26">
          2026년 7월 26일 일요일
        </DiaryEntryDate>
        <EmotionBadge emotion="calm" />
      </DiaryEntryHeader>
      <DiaryEntryBody>조용한 하루. 비가 왔다.</DiaryEntryBody>
    </DiaryEntry>
  ),
}
