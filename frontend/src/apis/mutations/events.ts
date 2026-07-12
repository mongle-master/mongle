import { mutationOptions } from '@tanstack/react-query'
import { createEvent, updateEvent } from '@/apis/generated/mongle-api'
import type { EventRequest } from '@/apis/generated/mongle-api.schemas'

export const register = () =>
  mutationOptions({
    mutationFn: (request: EventRequest) => createEvent(request),
  })

export const update = (id: number) =>
  mutationOptions({
    mutationFn: (request: EventRequest) => updateEvent(id, request),
  })
