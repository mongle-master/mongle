import {
  completeProfileSetup,
  issueToken,
  seed,
} from '@/apis/generated/mongle-api'
import type { UserProfileRequest } from '@/apis/generated/mongle-api.schemas'
import { setToken } from '@/lib/auth-token'
import type { UserIdentity } from '@/lib/user-identity'

export type UserProfileInput = {
  profileImageUrl: string | null
  gender: 'FEMALE' | 'MALE' | null
}

async function authenticate(identity: UserIdentity) {
  const res = await issueToken(identity)
  setToken(res.token)
  return res
}

export async function seedCurrentUser() {
  await seed()
}

export async function authenticateUser(identity: UserIdentity) {
  return authenticate(identity)
}

export async function completeUserProfile(profile: UserProfileInput) {
  const request: UserProfileRequest = {
    profileImageUrl: profile.profileImageUrl ?? undefined,
    gender: profile.gender ?? undefined,
  }
  await completeProfileSetup(request)
}
