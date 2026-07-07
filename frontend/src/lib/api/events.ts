import { api } from '@/lib/api/client'
import type {
  ActivityFlowResponse,
  EventRequest,
  EventResponse,
} from '@/lib/api/types'

export async function createEvent(body: EventRequest) {
  return api.post('v1/events', { json: body }).json<EventResponse>()
}

export async function fetchPersonTimeline(personId: number) {
  return api.get(`v1/persons/${personId}/timeline`).json<EventResponse[]>()
}

export async function fetchActivityFlow(personId: number) {
  return api
    .get(`v1/persons/${personId}/activity-flow`)
    .json<ActivityFlowResponse>()
}
