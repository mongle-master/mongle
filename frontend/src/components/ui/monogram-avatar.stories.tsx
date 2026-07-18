import { MonogramAvatar } from '@/components/ui/monogram-avatar'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/MonogramAvatar',
  component: MonogramAvatar,
  tags: ['autodocs'],
  args: {
    name: '김민수',
  },
  argTypes: {
    gender: {
      control: 'select',
      options: ['FEMALE', 'MALE'],
    },
    favoriteBadge: {
      control: 'select',
      options: ['compact', 'prominent'],
    },
  },
} satisfies Meta<typeof MonogramAvatar>

export default meta

type Story = StoryObj<typeof meta>

// imageUrl 로드 실패 시에만 monogram fallback이 드러나므로 깨진 URL을 넣어 확인한다.
export const MonogramFallback: Story = {
  args: { name: '엄마', imageUrl: 'https://broken.invalid/person.png' },
}

export const WithImage: Story = {
  args: { imageUrl: 'https://picsum.photos/200' },
}

export const FavoriteCompact: Story = {
  args: { favorite: true, favoriteBadge: 'compact' },
}

export const FavoriteProminent: Story = {
  args: { favorite: true, favoriteBadge: 'prominent' },
}

// imageUrl이 없으면 gender에 따라 성별 기본 이미지가 선택된다.
export const ByGender: Story = {
  render: () => (
    <div className="flex items-center gap-4">
      <MonogramAvatar name="유진" gender="FEMALE" />
      <MonogramAvatar name="지훈" gender="MALE" />
    </div>
  ),
}
