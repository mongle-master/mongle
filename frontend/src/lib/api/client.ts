import ky from 'ky'
import { clearToken, getToken } from '@/lib/auth-token'

const API_PREFIX = import.meta.env.VITE_API_URL ?? '/api'

export const api = ky.create({
  baseUrl: API_PREFIX.endsWith('/') ? API_PREFIX : `${API_PREFIX}/`,
  retry: 0,
  hooks: {
    beforeRequest: [
      ({ request }) => {
        const token = getToken()
        if (token) {
          request.headers.set('Authorization', `Bearer ${token}`)
        }
      },
    ],
    afterResponse: [
      async ({ response }) => {
        if (response.status === 401) {
          clearToken()
        }
      },
    ],
  },
})

export function mediaUrl(path: string | null | undefined) {
  if (!path) return null
  if (path.startsWith('http')) return path
  const base = import.meta.env.VITE_MEDIA_URL ?? ''
  return `${base}${path}`
}
