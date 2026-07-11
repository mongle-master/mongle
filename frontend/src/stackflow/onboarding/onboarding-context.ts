import { createContext, useContext } from 'react'
import type { UserProfileInput } from '@/lib/api/auth'

// 온보딩 activity는 URL 파라미터가 아니라 부트스트랩(main.tsx)의 인증 상태 머신과
// 대화해야 하므로, 직렬화되는 activity params 대신 컨텍스트로 상태·콜백을 받는다.
export type OnboardingContextValue = {
  username: string | null
  /** 이름 제출 후 토큰 발급이 진행 중인지 (이름 단계 버튼 pending 표시용) */
  authenticating: boolean
  onSubmitName: (username: string) => void
  onCompleteProfile: (profile: UserProfileInput) => Promise<void>
}

export const OnboardingContext = createContext<OnboardingContextValue | null>(
  null,
)

export function useOnboarding(): OnboardingContextValue {
  const value = useContext(OnboardingContext)
  if (!value) throw new Error('OnboardingContext가 제공되지 않았습니다.')
  return value
}
