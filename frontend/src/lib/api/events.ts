import { api } from '@/lib/api/client'
import {
  dummyActivityFlow,
  dummyEvent,
  dummyPersonTimeline,
} from '@/lib/dummy-data'
import { DUMMY_DATA_MODE, DummyModeError } from '@/lib/dummy-mode'
import type {
  ActivityFlowResponse,
  EventRequest,
  EventResponse,
} from '@/lib/api/types'

export async function createEvent(body: EventRequest) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  return api.post('v1/events', { json: body }).json<EventResponse>()
}

export async function fetchEvent(id: number) {
  if (DUMMY_DATA_MODE) return dummyEvent(id)
  return api.get(`v1/events/${id}`).json<EventResponse>()
}

export async function updateEvent(id: number, body: EventRequest) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  return api.put(`v1/events/${id}`, { json: body }).json<EventResponse>()
}

export async function fetchPersonTimeline(
  personId: number,
  categoryChipIds?: number[],
) {
  if (DUMMY_DATA_MODE) return dummyPersonTimeline(personId, categoryChipIds)
  const searchParams = new URLSearchParams()
  categoryChipIds?.forEach((id) =>
    searchParams.append('categoryChipIds', String(id)),
  )
  const qs = searchParams.toString()
  return api
    .get(`v1/persons/${personId}/timeline${qs ? `?${qs}` : ''}`)
    .json<EventResponse[]>()
}

export async function fetchActivityFlow(personId: number) {
  if (DUMMY_DATA_MODE) return dummyActivityFlow(personId)
  return api
    .get(`v1/persons/${personId}/activity-flow`)
    .json<ActivityFlowResponse>()
}
