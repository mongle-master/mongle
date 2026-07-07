import { api } from '@/lib/api/client'
import type {
  PersonDetailResponse,
  PersonRequest,
  PersonResponse,
} from '@/lib/api/types'

export async function fetchPersons(query?: string) {
  const searchParams = new URLSearchParams({ sort: 'NAME' })
  if (query?.trim()) searchParams.set('query', query.trim())
  return api.get(`v1/persons?${searchParams}`).json<PersonResponse[]>()
}

export async function fetchPerson(id: number) {
  return api.get(`v1/persons/${id}`).json<PersonDetailResponse>()
}

export async function createPerson(body: PersonRequest) {
  return api.post('v1/persons', { json: body }).json<PersonResponse>()
}
