import { mutationOptions } from '@tanstack/react-query'
import {
  createPerson,
  deletePerson,
  togglePersonFavorite,
  updatePerson,
} from '@/apis/generated/mongle-api'
import type { PersonRequest } from '@/apis/generated/models'

export const register = () =>
  mutationOptions({
    mutationFn: (request: PersonRequest) => createPerson(request),
  })

export const update = (id: number) =>
  mutationOptions({
    mutationFn: (request: PersonRequest) => updatePerson(id, request),
  })

export const remove = () => mutationOptions({ mutationFn: deletePerson })

export const toggleFavoriteById = () =>
  mutationOptions({ mutationFn: togglePersonFavorite })
