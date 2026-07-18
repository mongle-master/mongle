import { useState } from 'react'
import type { ComponentProps } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ProfileHero } from '@/components/person/person-form'

// ProfileHero만 시각 스토리 대상. person-form.tsx의 나머지 export
// (PersonFormValues, personToFormValues 등)는 타입/헬퍼라 스킵.
function ProfileHeroDemo(args: ComponentProps<typeof ProfileHero>) {
  const [favorite, setFavorite] = useState(args.favorite)
  return (
    <div className="max-w-md">
      <ProfileHero
        {...args}
        favorite={favorite}
        onFavoriteToggle={() => setFavorite((value) => !value)}
        onPhotoClick={() => {}}
      />
    </div>
  )
}

const meta = {
  title: 'Person/ProfileHero',
  component: ProfileHero,
  tags: ['autodocs'],
  args: {
    name: '',
    imageUrl: null,
    favorite: false,
    uploading: false,
    onPhotoClick: () => {},
    onFavoriteToggle: () => {},
  },
  render: (args) => <ProfileHeroDemo {...args} />,
} satisfies Meta<typeof ProfileHero>

export default meta

type Story = StoryObj<typeof meta>

// 이름·사진 모두 없으면 점선 카메라 자리표시.
export const NoPhoto: Story = {}

// 이름만 있으면 모노그램 아바타.
export const WithName: Story = {
  args: { name: '김민수' },
}

export const WithPhoto: Story = {
  args: { name: '이서연', imageUrl: 'https://picsum.photos/200' },
}

export const Favorite: Story = {
  args: { name: '엄마', favorite: true },
}

export const Uploading: Story = {
  args: { name: '박지훈', uploading: true },
}
