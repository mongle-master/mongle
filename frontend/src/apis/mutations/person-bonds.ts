import { mutationOptions } from '@tanstack/react-query'
import { createPersonBond, deletePersonBond } from '@/apis/generated/mongle-api'
import type { PersonBondRequest } from '@/apis/generated/mongle-api.schemas'

// 사이는 방향이 없어 두 id 의 순서를 맞출 필요가 없다 — 끌어다 놓은 순서 그대로 보내면 서버가 눕힌다.
export const connect = () =>
  mutationOptions({
    mutationFn: (request: PersonBondRequest) => createPersonBond(request),
  })

export const disconnect = () =>
  mutationOptions({ mutationFn: deletePersonBond })
