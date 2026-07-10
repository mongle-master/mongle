import { api } from '@/lib/api/client'
import { getToken, setToken } from '@/lib/auth-token'
import { DUMMY_DATA_MODE } from '@/lib/dummy-mode'

type TokenResponse = { token: string }

export async function loginDemo(username = 'demo') {
  const res = await api
    .post('v1/auth/token', { json: { username } })
    .json<TokenResponse>()
  setToken(res.token)
  return res.token
}

export async function ensureDemoAuth() {
  if (DUMMY_DATA_MODE) return
  if (getToken()) return
  await loginDemo('demo')
}
