import { api } from '@/lib/api/client'
import type {
  PersonDetailResponse,
  PersonRequest,
  PersonResponse,
} from '@/lib/api/types'

export async function fetchPersons(
  query?: string,
  sort: 'NAME' | 'RECENT' = 'NAME',
) {
  const searchParams = new URLSearchParams({ sort })
  if (query?.trim()) searchParams.set('query', query.trim())
  return api.get(`v1/persons?${searchParams}`).json<PersonResponse[]>()
}

export async function fetchPerson(id: number) {
  return api.get(`v1/persons/${id}`).json<PersonDetailResponse>()
}

export async function createPerson(body: PersonRequest) {
  return api.post('v1/persons', { json: body }).json<PersonResponse>()
}

export async function updatePerson(id: number, body: PersonRequest) {
  return api.put(`v1/persons/${id}`, { json: body }).json<PersonResponse>()
}

export async function deletePerson(id: number) {
  await api.delete(`v1/persons/${id}`)
}

export async function togglePersonFavorite(id: number) {
  return api.patch(`v1/persons/${id}/favorite`).json<PersonResponse>()
}
