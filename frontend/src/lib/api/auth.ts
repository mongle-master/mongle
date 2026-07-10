import { api } from '@/lib/api/client'
import { setToken } from '@/lib/auth-token'
import type { UserIdentity } from '@/lib/user-identity'

type TokenResponse = { token: string }

async function issueToken(identity: UserIdentity) {
  const res = await api
    .post('v1/auth/token', { json: identity })
    .json<TokenResponse>()
  setToken(res.token)
}

async function seedCurrentUser() {
  await api.post('v1/seed')
}

export async function authenticateUser(identity: UserIdentity) {
  await issueToken(identity)
  await seedCurrentUser()
}
