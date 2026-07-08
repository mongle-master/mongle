import { api } from '@/lib/api/client'
import type {
  ActivityFlowResponse,
  EventRequest,
  EventResponse,
} from '@/lib/api/types'

export async function createEvent(body: EventRequest) {
  return api.post('v1/events', { json: body }).json<EventResponse>()
}

export async function fetchEvent(id: number) {
  return api.get(`v1/events/${id}`).json<EventResponse>()
}

export async function updateEvent(id: number, body: EventRequest) {
  return api.put(`v1/events/${id}`, { json: body }).json<EventResponse>()
}

export async function fetchPersonTimeline(
  personId: number,
  categoryChipIds?: number[],
) {
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
  return api
    .get(`v1/persons/${personId}/activity-flow`)
    .json<ActivityFlowResponse>()
}
