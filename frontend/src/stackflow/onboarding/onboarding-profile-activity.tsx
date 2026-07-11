import { AppScreen } from '@stackflow/plugin-basic-ui'
import type { ActivityComponentType } from '@stackflow/react'
import { ProfileOnboarding } from '@/components/auth/profile-onboarding'
import { useOnboarding } from '@/stackflow/onboarding/onboarding-context'

export const OnboardingProfileActivity: ActivityComponentType<
  'OnboardingProfile'
> = () => {
  const { username, onCompleteProfile } = useOnboarding()

  return (
    // 이름 단계에서 이미 서버에 identity가 커밋되므로 뒤로 돌아가는 제스처를 막는다
    <AppScreen preventSwipeBack>
      <ProfileOnboarding
        username={username ?? ''}
        onComplete={onCompleteProfile}
      />
    </AppScreen>
  )
}
