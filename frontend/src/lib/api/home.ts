import { api } from '@/lib/api/client'
import { dummyRelationMap, dummyThrowback } from '@/lib/dummy-data'
import { DUMMY_DATA_MODE } from '@/lib/dummy-mode'
import type { RelationMapResponse, ThrowbackResponse } from '@/lib/api/types'

export async function fetchRelationMap(relationTagChipIds?: number[]) {
  if (DUMMY_DATA_MODE) return dummyRelationMap(relationTagChipIds)
  const searchParams = new URLSearchParams()
  relationTagChipIds?.forEach((id) =>
    searchParams.append('relationTagChipIds', String(id)),
  )
  const qs = searchParams.toString()
  return api
    .get(`v1/home/relation-map${qs ? `?${qs}` : ''}`)
    .json<RelationMapResponse>()
}

export async function fetchThrowback() {
  if (DUMMY_DATA_MODE) return dummyThrowback()
  const res = await api.get('v1/home/throwback')
  if (res.status === 204) return null
  return res.json<ThrowbackResponse>()
}
