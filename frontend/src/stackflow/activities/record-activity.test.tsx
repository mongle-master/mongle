import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render, screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import type {
  ChipResponse,
  EventResponse,
  PersonResponse,
} from '@/lib/api/types'
import { RecordActivity } from './record-activity'

const flow = vi.hoisted(() => ({
  pop: vi.fn(),
  push: vi.fn(),
  replace: vi.fn(),
}))
const api = vi.hoisted(() => ({
  createEvent: vi.fn(),
  fetchChips: vi.fn(),
  fetchPersons: vi.fn(),
}))

vi.mock('@stackflow/react', () => ({
  useFlow: () => flow,
}))
vi.mock('@/stackflow/components/app-screen', () => ({
  AppScreen: ({ children }: { children: React.ReactNode }) => (
    <div>{children}</div>
  ),
}))
vi.mock('@/stackflow/use-enter-done', () => ({
  useEnterDone: () => true,
}))
vi.mock('@/lib/api/chips', () => ({
  fetchChips: api.fetchChips,
}))
vi.mock('@/lib/api/events', () => ({
  createEvent: api.createEvent,
  fetchEvent: vi.fn(),
  updateEvent: vi.fn(),
}))
vi.mock('@/lib/api/persons', () => ({
  fetchPersons: api.fetchPersons,
}))

const person: PersonResponse = {
  id: 1,
  name: '민지',
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
}
const chips: ChipResponse[] = [
  {
    id: 10,
    type: 'CATEGORY',
    label: '만남',
    personal: false,
    order: 0,
    default: true,
  },
  {
    id: 20,
    type: 'EMOTION',
    label: '반가움',
    personal: false,
    order: 0,
    default: true,
  },
]
const savedEvent: EventResponse = {
  id: 100,
  title: '민지 · 만남',
  memo: null,
  occurredDate: '2026-07-12',
  occurredTime: null,
  category: null,
  weather: null,
  emotions: [],
  persons: [{ id: 1, name: '민지' }],
  photoUrls: [],
  createdAt: null,
}

const Activity = RecordActivity as unknown as React.FC<{
  params: { personId: string }
}>

function renderActivity() {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <Activity params={{ personId: '1' }} />
    </QueryClientProvider>,
  )
}

describe('RecordActivity', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    api.fetchPersons.mockResolvedValue([person])
    api.fetchChips.mockResolvedValue(chips)
  })

  it('칩 응답을 받기 전에는 기록 저장 화면을 열지 않는다', async () => {
    let resolveChips: (chips: ChipResponse[]) => void = () => undefined
    api.fetchChips.mockReturnValue(
      new Promise<ChipResponse[]>((resolve) => {
        resolveChips = resolve
      }),
    )

    renderActivity()

    expect(screen.getByText('불러오는 중…')).toBeInTheDocument()
    expect(screen.queryByRole('button', { name: '저장' })).toBeNull()

    resolveChips(chips)

    expect(await screen.findByRole('button', { name: '저장' })).toBeEnabled()
  })

  it('칩 조회 실패를 오류 상태로 보여주고 다시 요청한다', async () => {
    const user = userEvent.setup()
    api.fetchChips
      .mockRejectedValueOnce(new Error('chip request failed'))
      .mockResolvedValueOnce(chips)

    renderActivity()

    expect(
      await screen.findByText('기록 선택지를 불러오지 못했어요.'),
    ).toBeInTheDocument()

    await user.click(screen.getByRole('button', { name: '다시 시도' }))

    expect(await screen.findByRole('button', { name: '저장' })).toBeEnabled()
    expect(api.fetchChips).toHaveBeenCalledTimes(2)
  })

  it('저장 실패 시 입력 화면을 유지하고 오류를 보여준다', async () => {
    const user = userEvent.setup()
    api.createEvent.mockRejectedValue(new Error('save failed'))

    renderActivity()

    await user.click(await screen.findByRole('button', { name: '반가웠다' }))
    await user.click(screen.getByRole('button', { name: '저장' }))

    expect(await screen.findByRole('alert')).toHaveTextContent(
      '기록을 저장하지 못했어요.',
    )
    expect(screen.getByRole('button', { name: '반가웠다' })).toHaveAttribute(
      'aria-pressed',
      'true',
    )
    expect(flow.pop).not.toHaveBeenCalled()
    expect(flow.replace).not.toHaveBeenCalled()
  })

  it('저장 성공 후에만 인물 타임라인으로 이동한다', async () => {
    const user = userEvent.setup()
    api.createEvent.mockResolvedValue(savedEvent)

    renderActivity()

    await user.click(await screen.findByRole('button', { name: '저장' }))

    await waitFor(() => {
      expect(flow.replace).toHaveBeenCalledWith('Person', {
        personId: '1',
        view: 'timeline',
      })
    })
  })
})
