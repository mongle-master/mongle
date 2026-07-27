import type { Meta, StoryObj } from '@storybook/react-vite'

import { Tabs, TabsContent, TabsList, TabsTrigger } from './tabs'

const meta = {
  title: 'Core/Tabs',
  component: Tabs,
} satisfies Meta<typeof Tabs>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: () => (
    <Tabs defaultValue="timeline" className="w-96">
      <TabsList>
        <TabsTrigger value="timeline">타임라인</TabsTrigger>
        <TabsTrigger value="records">기록</TabsTrigger>
        <TabsTrigger value="profile">프로필</TabsTrigger>
      </TabsList>
      <TabsContent value="timeline">
        <p className="text-body-sm text-body py-2">시간순 활동 흐름</p>
      </TabsContent>
      <TabsContent value="records">
        <p className="text-body-sm text-body py-2">사람별 기록 목록</p>
      </TabsContent>
      <TabsContent value="profile">
        <p className="text-body-sm text-body py-2">사람 프로필</p>
      </TabsContent>
    </Tabs>
  ),
}
