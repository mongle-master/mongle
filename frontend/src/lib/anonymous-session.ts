const ANONYMOUS_ID_KEY = 'mongle_anonymous_id'

export function getOrCreateAnonymousId(): string {
  const storedId = localStorage.getItem(ANONYMOUS_ID_KEY)
  if (storedId) return storedId

  const anonymousId = crypto.randomUUID()
  localStorage.setItem(ANONYMOUS_ID_KEY, anonymousId)
  return anonymousId
}
