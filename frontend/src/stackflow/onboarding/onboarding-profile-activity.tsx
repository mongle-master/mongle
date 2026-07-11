import { AppScreen } from '@/stackflow/components/app-screen'
import { useActivity, useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { ProfileOnboarding } from '@/components/auth/profile-onboarding'
import { useOnboarding } from '@/stackflow/onboarding/onboarding-context'

export const OnboardingProfileActivity: ActivityComponentType<
  'OnboardingProfile'
> = () => {
  const { username, onCompleteProfile } = useOnboarding()
  const { pop } = useFlow()
  // 퍼널 중간 이탈 후 재방문이면 이 화면이 루트라 되돌아갈 이름 단계가 없다
  const { isRoot } = useActivity()

  return (
    <AppScreen>
      <ProfileOnboarding
        username={username ?? ''}
        onBack={isRoot ? undefined : () => pop()}
        onComplete={onCompleteProfile}
      />
    </AppScreen>
  )
}
