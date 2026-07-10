import { api } from '@/lib/api/client'
import { getOrCreateAnonymousId } from '@/lib/anonymous-session'
import { getToken, setToken } from '@/lib/auth-token'

type TokenResponse = { token: string }

async function loginAnonymous(anonymousId: string): Promise<string> {
  const res = await api
    .post('v1/auth/token', { json: { username: anonymousId } })
    .json<TokenResponse>()
  setToken(res.token)
  return res.token
}

export async function ensureAnonymousAuth(): Promise<void> {
  if (getToken()) return
  await loginAnonymous(getOrCreateAnonymousId())
}
