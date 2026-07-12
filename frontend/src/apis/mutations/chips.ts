import { mutationOptions } from '@tanstack/react-query'
import { createChip, deleteChip, updateChip } from '@/apis/generated/mongle-api'
import type {
  ChipCreateRequest,
  ChipRenameRequest,
} from '@/apis/generated/mongle-api.schemas'

export const create = () =>
  mutationOptions({
    mutationFn: (request: ChipCreateRequest) => createChip(request),
  })

export const update = () =>
  mutationOptions({
    mutationFn: ({ id, request }: { id: number; request: ChipRenameRequest }) =>
      updateChip(id, request),
  })

export const remove = () =>
  mutationOptions({
    mutationFn: deleteChip,
  })
