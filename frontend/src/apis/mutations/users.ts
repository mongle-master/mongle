import { mutationOptions } from '@tanstack/react-query'
import { deleteCurrentUser } from '@/apis/generated/mongle-api'

export const removeCurrent = () =>
  mutationOptions({ mutationFn: deleteCurrentUser })
