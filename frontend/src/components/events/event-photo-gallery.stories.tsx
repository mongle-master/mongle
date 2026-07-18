import { EventPhotoGallery } from '@/components/events/event-photo-gallery'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'Events/EventPhotoGallery',
  component: EventPhotoGallery,
  tags: ['autodocs'],
} satisfies Meta<typeof EventPhotoGallery>

export default meta

type Story = StoryObj<typeof meta>

export const SinglePhoto: Story = {
  args: {
    photoUrls: ['https://picsum.photos/seed/mongle-1/400'],
  },
}

export const FourPhotos: Story = {
  args: {
    photoUrls: [
      'https://picsum.photos/seed/mongle-1/400',
      'https://picsum.photos/seed/mongle-2/400',
      'https://picsum.photos/seed/mongle-3/400',
      'https://picsum.photos/seed/mongle-4/400',
    ],
  },
}

export const OverflowMany: Story = {
  args: {
    photoUrls: [
      'https://picsum.photos/seed/mongle-1/400',
      'https://picsum.photos/seed/mongle-2/400',
      'https://picsum.photos/seed/mongle-3/400',
      'https://picsum.photos/seed/mongle-4/400',
      'https://picsum.photos/seed/mongle-5/400',
      'https://picsum.photos/seed/mongle-6/400',
      'https://picsum.photos/seed/mongle-7/400',
    ],
  },
}

// photoUrls가 비면 컴포넌트가 null을 반환해 아무것도 렌더링하지 않는다.
export const Empty: Story = {
  args: {
    photoUrls: [],
  },
}
