import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type { EventResponse } from '@/lib/api/types'
import { RecordActivity } from './record-activity'

const createEvent = vi.fn()
const fetchEvent = vi.fn()
const updateEvent = vi.fn()

vi.mock('@stackflow/react', () => ({
  useFlow: () => ({ pop: vi.fn(), replace: vi.fn(), push: vi.fn() }),
}))
vi.mock('@/stackflow/components/app-screen', () => ({
  AppScreen: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock('@/stackflow/use-enter-done', () => ({
  useEnterDone: () => true,
}))
vi.mock('@/components/record/date-time-wheel', () => ({
  DateStrip: () => <div>날짜 선택</div>,
  TimeWheel: () => <div>시간 선택</div>,
}))
vi.mock('@/lib/api/chips', () => ({
  fetchChips: vi.fn().mockResolvedValue([
    {
      id: 1,
      type: 'CATEGORY',
      label: '만남',
      personal: false,
      order: 0,
      default: true,
    },
    {
      id: 10,
      type: 'WEATHER',
      label: '맑음',
      personal: false,
      order: 0,
      default: false,
    },
    {
      id: 11,
      type: 'WEATHER',
      label: '비',
      personal: false,
      order: 1,
      default: false,
    },
  ]),
}))
vi.mock('@/lib/api/persons', () => ({
  fetchPersons: vi.fn().mockResolvedValue([
    {
      id: 7,
      name: '성빈',
      birthday: null,
      firstMetDate: null,
      lastMetDate: null,
      profileImageUrl: null,
      gender: null,
      relationType: null,
      relationTags: [],
      likes: [],
      cautions: [],
      favorite: false,
      createdAt: null,
    },
  ]),
}))
vi.mock('@/lib/api/events', () => ({
  createEvent: (...args: unknown[]) => createEvent(...args),
  fetchEvent: (...args: unknown[]) => fetchEvent(...args),
  updateEvent: (...args: unknown[]) => updateEvent(...args),
}))

const Activity = RecordActivity as unknown as React.FC<{
  params: { personId?: string; eventId?: string }
}>

function renderActivity(params: { personId?: string; eventId?: string }) {
  const queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  })
  return render(
    <QueryClientProvider client={queryClient}>
      <Activity params={params} />
    </QueryClientProvider>,
  )
}

async function moveToDetail(user: ReturnType<typeof userEvent.setup>) {
  await user.click(await screen.findByRole('button', { name: '이어서' }))
  await user.click(screen.getByRole('button', { name: '이어서' }))
  await screen.findByText('날씨')
}

describe('RecordActivity weather input', () => {
  beforeEach(() => {
    window.history.replaceState(null, '', '/record')
    createEvent.mockReset()
    fetchEvent.mockReset()
    updateEvent.mockReset()
  })

  it('stores one selected weather chip in a new event payload', async () => {
    const user = userEvent.setup()
    createEvent.mockResolvedValue({ persons: [{ id: 7 }] })
    renderActivity({ personId: '7' })

    await moveToDetail(user)
    await user.click(screen.getByRole('radio', { name: '맑음' }))
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(createEvent).toHaveBeenCalledWith(
        expect.objectContaining({ weatherChipId: 10 }),
      )
    })
  })

  it('restores the weather chip and allows clearing it while editing', async () => {
    const user = userEvent.setup()
    const event: EventResponse = {
      id: 30,
      title: '기록',
      memo: null,
      occurredDate: '2026-07-12',
      occurredTime: null,
      category: { id: 1, label: '만남' },
      weather: { id: 11, label: '비' },
      emotions: [],
      persons: [{ id: 7, name: '성빈' }],
      photoUrls: [],
      createdAt: null,
    }
    fetchEvent.mockResolvedValue(event)
    updateEvent.mockResolvedValue(event)
    renderActivity({ eventId: '30' })

    await moveToDetail(user)
    const rain = screen.getByRole('radio', { name: '비' })
    expect(rain).toHaveAttribute('aria-checked', 'true')

    await user.click(rain)
    await user.click(screen.getByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(updateEvent).toHaveBeenCalledWith(
        30,
        expect.objectContaining({ weatherChipId: null }),
      )
    })
  })
})
