import { api } from '@/lib/api/client'
import type { ChipResponse, ChipType } from '@/lib/api/types'

const CHIP_TYPES: ChipType[] = [
  'CATEGORY',
  'RELATION_TAG',
  'EMOTION',
  'WEATHER',
]

export async function fetchChips(type?: ChipType) {
  if (type) {
    return api
      .get('v1/chips', { searchParams: { type } })
      .json<ChipResponse[]>()
  }
  const groups = await Promise.all(
    CHIP_TYPES.map((t) =>
      api.get('v1/chips', { searchParams: { type: t } }).json<ChipResponse[]>(),
    ),
  )
  return groups.flat()
}

export async function createChip(type: ChipType, label: string) {
  return api.post('v1/chips', { json: { type, label } }).json<ChipResponse>()
}

export async function renameChip(id: number, label: string) {
  return api.patch(`v1/chips/${id}`, { json: { label } }).json<ChipResponse>()
}

export async function deleteChip(id: number) {
  await api.delete(`v1/chips/${id}`)
}
