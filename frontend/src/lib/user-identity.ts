const USER_IDENTITY_KEY = 'mongle_user_identity'

export type UserIdentity = {
  userId: string
  username: string
}

export function getUserIdentity(): UserIdentity | null {
  const stored = localStorage.getItem(USER_IDENTITY_KEY)
  if (!stored) return null

  try {
    const identity = JSON.parse(stored) as Partial<UserIdentity>
    if (!identity.userId || !identity.username) return null
    return { userId: identity.userId, username: identity.username }
  } catch {
    return null
  }
}

export function createUserIdentity(username: string): UserIdentity {
  const identity = {
    userId: crypto.randomUUID(),
    username: username.trim(),
  }
  localStorage.setItem(USER_IDENTITY_KEY, JSON.stringify(identity))
  return identity
}
