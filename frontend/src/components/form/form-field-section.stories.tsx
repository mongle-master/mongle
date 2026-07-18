import {
  FormFieldCard,
  FormFieldSection,
} from '@/components/form/form-field-section'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Form/FormFieldSection',
  component: FormFieldSection,
  tags: ['autodocs'],
} satisfies Meta<typeof FormFieldSection>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    title: '메모',
    children: (
      <p className="text-sm text-foreground">
        오랜만에 만났다. 많이 밝아진 느낌.
      </p>
    ),
  },
}

export const WithCard: Story = {
  args: {
    title: '기본 정보',
    children: <FormFieldCard>김민수 · 대학 동기</FormFieldCard>,
  },
}

export const LongTitle: Story = {
  args: {
    title: '이 사람과의 관계에서 특별히 기억하고 싶은 순간이나 맥락',
    children: <FormFieldCard>첫 만남은 신입생 오리엔테이션</FormFieldCard>,
  },
}

export const MultipleChildren: Story = {
  args: {
    title: '함께한 기록',
    children: (
      <div className="flex flex-col gap-2">
        <FormFieldCard>2024-03-02 · 벚꽃 구경</FormFieldCard>
        <FormFieldCard>2024-06-15 · 집들이</FormFieldCard>
        <FormFieldCard>2024-12-24 · 연말 모임</FormFieldCard>
      </div>
    ),
  },
}

// Form/FormFieldCard는 별도 파일 대신 이 스토리 파일에서 함께 다룬다(같은 소스 파일 export).
export const CardOnly: StoryObj<typeof FormFieldCard> = {
  render: () => <FormFieldCard>엄마 · 010-0000-0000</FormFieldCard>,
}
