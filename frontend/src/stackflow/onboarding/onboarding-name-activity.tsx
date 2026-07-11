import { AppScreen } from '@stackflow/plugin-basic-ui'
import type { ActivityComponentType } from '@stackflow/react'
import { NameOnboarding } from '@/components/auth/name-onboarding'
import { useOnboarding } from '@/stackflow/onboarding/onboarding-context'

export const OnboardingNameActivity: ActivityComponentType<
  'OnboardingName'
> = () => {
  const { authenticating, onSubmitName } = useOnboarding()

  return (
    <AppScreen>
      <NameOnboarding pending={authenticating} onSubmit={onSubmitName} />
    </AppScreen>
  )
}
