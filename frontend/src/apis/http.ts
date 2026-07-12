import type { Options } from 'ky'
import { api } from '@/lib/api/client'

type OrvalRequestConfig = {
  url: string
  method: string
  headers?: Record<string, string>
  params?: Record<string, unknown>
  data?: unknown
  signal?: AbortSignal
}

function createSearchParams(params: Record<string, unknown> | undefined) {
  const searchParams = new URLSearchParams()

  Object.entries(params ?? {}).forEach(([key, value]) => {
    if (value === undefined || value === null) return
    const values = Array.isArray(value) ? value : [value]
    values.forEach((item) => searchParams.append(key, String(item)))
  })

  return searchParams
}

export async function kyAxiosAdapter<TResponse>(
  config: OrvalRequestConfig,
): Promise<TResponse> {
  const { url, method, headers, params, data, signal } = config
  const options: Options = {
    method,
    headers,
    signal,
    searchParams: createSearchParams(params),
  }

  if (data instanceof FormData) {
    options.body = data
  } else if (data !== undefined) {
    options.json = data
  }

  const response = await api(url.replace(/^\/api\//, ''), options)
  if (response.status === 204 || response.status === 205) {
    return undefined as TResponse
  }

  const responseText = await response.text()
  if (!responseText) return undefined as TResponse
  return JSON.parse(responseText) as TResponse
}

export type ErrorType<TError> = TError
export type BodyType<TBody> = TBody
