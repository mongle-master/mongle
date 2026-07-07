import { api } from '@/lib/api/client'
import type { ChipResponse } from '@/lib/api/types'

export async function fetchChips() {
  return api.get('v1/chips').json<ChipResponse[]>()
}
