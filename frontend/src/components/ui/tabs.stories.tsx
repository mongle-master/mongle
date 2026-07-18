import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
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
    <Tabs defaultValue="record" className="w-80">
      <TabsList>
        <TabsTrigger value="record">기록</TabsTrigger>
        <TabsTrigger value="people">사람</TabsTrigger>
        <TabsTrigger value="events">일정</TabsTrigger>
      </TabsList>
      <TabsContent value="record">최근 기록이 여기에 표시됩니다.</TabsContent>
      <TabsContent value="people">등록된 사람 목록입니다.</TabsContent>
      <TabsContent value="events">다가오는 일정입니다.</TabsContent>
    </Tabs>
  ),
}

export const LineVariant: Story = {
  render: () => (
    <Tabs defaultValue="record" className="w-80">
      <TabsList variant="line">
        <TabsTrigger value="record">기록</TabsTrigger>
        <TabsTrigger value="people">사람</TabsTrigger>
        <TabsTrigger value="events">일정</TabsTrigger>
      </TabsList>
      <TabsContent value="record">최근 기록이 여기에 표시됩니다.</TabsContent>
      <TabsContent value="people">등록된 사람 목록입니다.</TabsContent>
      <TabsContent value="events">다가오는 일정입니다.</TabsContent>
    </Tabs>
  ),
}

export const Vertical: Story = {
  render: () => (
    <Tabs orientation="vertical" defaultValue="record" className="w-96">
      <TabsList>
        <TabsTrigger value="record">기록</TabsTrigger>
        <TabsTrigger value="people">사람</TabsTrigger>
        <TabsTrigger value="events">일정</TabsTrigger>
      </TabsList>
      <TabsContent value="record">최근 기록이 여기에 표시됩니다.</TabsContent>
      <TabsContent value="people">등록된 사람 목록입니다.</TabsContent>
      <TabsContent value="events">다가오는 일정입니다.</TabsContent>
    </Tabs>
  ),
}

export const DisabledTab: Story = {
  render: () => (
    <Tabs defaultValue="record" className="w-80">
      <TabsList>
        <TabsTrigger value="record">기록</TabsTrigger>
        <TabsTrigger value="people">사람</TabsTrigger>
        <TabsTrigger value="events" disabled>
          일정
        </TabsTrigger>
      </TabsList>
      <TabsContent value="record">최근 기록이 여기에 표시됩니다.</TabsContent>
      <TabsContent value="people">등록된 사람 목록입니다.</TabsContent>
      <TabsContent value="events">다가오는 일정입니다.</TabsContent>
    </Tabs>
  ),
}
