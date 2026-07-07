import { api } from '@/lib/api/client'
import type { RelationMapResponse, ThrowbackResponse } from '@/lib/api/types'

export async function fetchRelationMap(relationTagChipIds?: number[]) {
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
  const res = await api.get('v1/home/throwback')
  if (res.status === 204) return null
  return res.json<ThrowbackResponse>()
}
