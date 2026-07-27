import { Tabs, TabsList, TabsTrigger, TabsContent } from './tabs'
import type { Meta, StoryObj } from '@storybook/react-vite'

const meta = {
  title: 'UI/Tabs',
  component: Tabs,
  tags: ['autodocs'],
} satisfies Meta<typeof Tabs>

export default meta

type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="diary" className="w-80">
      <TabsList>
        <TabsTrigger value="diary">일기</TabsTrigger>
        <TabsTrigger value="emotion">감정</TabsTrigger>
        <TabsTrigger value="gratitude">감사</TabsTrigger>
      </TabsList>
      <TabsContent value="diary">
        <p className="py-4 text-sm text-muted-foreground">일기 탭 내용</p>
      </TabsContent>
      <TabsContent value="emotion">
        <p className="py-4 text-sm text-muted-foreground">감정 탭 내용</p>
      </TabsContent>
      <TabsContent value="gratitude">
        <p className="py-4 text-sm text-muted-foreground">감사 탭 내용</p>
      </TabsContent>
    </Tabs>
  ),
}
