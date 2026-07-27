import {
  PersonCard,
  PersonCardAvatar,
  PersonCardInfo,
  PersonCardName,
  PersonCardRelation,
} from '@/components/ui/person-card'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/PersonCard',
  component: PersonCard,
  tags: ['autodocs'],
} satisfies Meta<typeof PersonCard>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <PersonCard className="w-72">
      <PersonCardAvatar name="김할머니" />
      <PersonCardInfo>
        <PersonCardName>김할머니</PersonCardName>
        <PersonCardRelation>공원 벤치 · 주 2회 만남</PersonCardRelation>
      </PersonCardInfo>
    </PersonCard>
  ),
}

export const LongText: Story = {
  render: () => (
    <PersonCard className="w-72">
      <PersonCardAvatar name="알렉산드라" />
      <PersonCardInfo>
        <PersonCardName>알렉산드라 김</PersonCardName>
        <PersonCardRelation>
          대학교 동기 · 매우 긴 관계 설명이 들어가는 경우 말줄임 처리 확인
        </PersonCardRelation>
      </PersonCardInfo>
    </PersonCard>
  ),
}

export const List: Story = {
  render: () => (
    <div className="flex w-72 flex-col gap-2">
      <PersonCard>
        <PersonCardAvatar name="엄마" />
        <PersonCardInfo>
          <PersonCardName>엄마</PersonCardName>
          <PersonCardRelation>가족 · 매일 통화</PersonCardRelation>
        </PersonCardInfo>
      </PersonCard>
      <PersonCard>
        <PersonCardAvatar name="지수" />
        <PersonCardInfo>
          <PersonCardName>지수</PersonCardName>
          <PersonCardRelation>친구 · 주 1회</PersonCardRelation>
        </PersonCardInfo>
      </PersonCard>
      <PersonCard>
        <PersonCardAvatar name="박선생님" />
        <PersonCardInfo>
          <PersonCardName>박선생님</PersonCardName>
          <PersonCardRelation>멘토 · 월 1회</PersonCardRelation>
        </PersonCardInfo>
      </PersonCard>
    </div>
  ),
}
