import { api } from '@/lib/api/client'
import { dummyPersonDetail, dummyPersons } from '@/lib/dummy-data'
import { DUMMY_DATA_MODE, DummyModeError } from '@/lib/dummy-mode'
import type {
  PersonDetailResponse,
  PersonRequest,
  PersonResponse,
} from '@/lib/api/types'

export async function fetchPersons(
  query?: string,
  sort: 'NAME' | 'RECENT' = 'NAME',
) {
  if (DUMMY_DATA_MODE) return dummyPersons(query, sort)
  const searchParams = new URLSearchParams({ sort })
  if (query?.trim()) searchParams.set('query', query.trim())
  return api.get(`v1/persons?${searchParams}`).json<PersonResponse[]>()
}

export async function fetchPerson(id: number) {
  if (DUMMY_DATA_MODE) return dummyPersonDetail(id)
  return api.get(`v1/persons/${id}`).json<PersonDetailResponse>()
}

export async function createPerson(body: PersonRequest) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  return api.post('v1/persons', { json: body }).json<PersonResponse>()
}

export async function updatePerson(id: number, body: PersonRequest) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  return api.put(`v1/persons/${id}`, { json: body }).json<PersonResponse>()
}

export async function deletePerson(id: number) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  await api.delete(`v1/persons/${id}`)
}

export async function togglePersonFavorite(id: number) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  return api.patch(`v1/persons/${id}/favorite`).json<PersonResponse>()
}
