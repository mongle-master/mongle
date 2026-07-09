import { markApiFallbackUsed } from '@/lib/api/fallback-status'

export async function safeApi<T>(
  fn: () => Promise<T>,
  fallback: T,
): Promise<T> {
  try {
    return await fn()
  } catch {
    markApiFallbackUsed()
    return fallback
  }
}
