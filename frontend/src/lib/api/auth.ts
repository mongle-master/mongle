import { api } from '@/lib/api/client'
import { setToken } from '@/lib/auth-token'
import type { UserIdentity } from '@/lib/user-identity'

type TokenResponse = {
  token: string
  profileSetupCompleted: boolean
}

export type UserProfileInput = {
  profileImageUrl: string | null
  gender: 'FEMALE' | 'MALE' | null
}

async function issueToken(identity: UserIdentity) {
  const res = await api
    .post('v1/auth/token', { json: identity })
    .json<TokenResponse>()
  setToken(res.token)
  return res
}

export async function seedCurrentUser() {
  await api.post('v1/seed')
}

export async function authenticateUser(identity: UserIdentity) {
  return issueToken(identity)
}

export async function completeUserProfile(profile: UserProfileInput) {
  await api.patch('v1/users/me/profile', { json: profile })
}

export async function deleteCurrentUser() {
  await api.delete('v1/users/me')
}
