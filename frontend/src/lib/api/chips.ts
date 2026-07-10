import { api } from '@/lib/api/client'
import { dummyChips } from '@/lib/dummy-data'
import { DUMMY_DATA_MODE, DummyModeError } from '@/lib/dummy-mode'
import type { ChipResponse, ChipType } from '@/lib/api/types'

const CHIP_TYPES: ChipType[] = [
  'CATEGORY',
  'RELATION_TAG',
  'EMOTION',
  'WEATHER',
]

export async function fetchChips(type?: ChipType) {
  if (DUMMY_DATA_MODE) return dummyChips(type)
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

export async function createChip(
  type: ChipType,
  label: string,
  color?: string | null,
) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  return api
    .post('v1/chips', { json: { type, label, color } })
    .json<ChipResponse>()
}

export async function renameChip(
  id: number,
  label: string,
  color?: string | null,
) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  return api
    .patch(`v1/chips/${id}`, { json: { label, color } })
    .json<ChipResponse>()
}

export async function deleteChip(id: number) {
  if (DUMMY_DATA_MODE) throw new DummyModeError()
  await api.delete(`v1/chips/${id}`)
}
