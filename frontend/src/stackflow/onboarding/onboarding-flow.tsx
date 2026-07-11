import { useEffect } from 'react'
import { defineConfig } from '@stackflow/config'
import { stackflow } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { basicUIPlugin } from '@stackflow/plugin-basic-ui'
import { activityComponents } from '@/stackflow/activity-components'
import { StackViewport } from '@/stackflow/components/stack-viewport'
import { OnboardingContext } from '@/stackflow/onboarding/onboarding-context'
import type { OnboardingContextValue } from '@/stackflow/onboarding/onboarding-context'
import { getUserIdentity } from '@/lib/user-identity'

// 인증 전 전용 스택. 앱 스택(stackflow.ts)과 분리한 이유:
// 1) 온보딩 동안 데이터 화면(Main 등)이 마운트되어 무토큰 쿼리를 쏘면 안 되고,
// 2) history-sync 없이 URL을 건드리지 않아야 딥링크가 온보딩 완료 후 그대로 살아난다.
//    (브라우저 뒤로가기는 단계 이동이 아니라 이탈 — 기존 부트스트랩과 동일한 동작)
const onboardingConfig = defineConfig({
  activities: [
    // route는 history-sync 전용 필드라 이 스택에서는 쓰이지 않지만 타입상 필수다
    { name: 'OnboardingName', route: '/onboarding/name' },
    { name: 'OnboardingProfile', route: '/onboarding/profile' },
  ],
  transitionDuration: 270,
  // 퍼널 중간 이탈 후 재방문(identity는 있는데 프로필 미완)이면 바로 2단계부터
  initialActivity: () =>
    getUserIdentity() ? 'OnboardingProfile' : 'OnboardingName',
})

const { Stack: OnboardingStack, actions: onboardingActions } = stackflow({
  config: onboardingConfig,
  components: activityComponents,
  plugins: [
    basicRendererPlugin(),
    basicUIPlugin({
      theme: 'cupertino',
      backgroundColor: 'var(--background)',
      appBar: {
        textColor: 'var(--foreground)',
        iconColor: 'var(--foreground)',
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border)',
      },
    }),
  ],
})

// 인스턴스가 모듈 스코프라 언마운트-재마운트(에러→재시도)에도 push 중복을 막는다.
// 재방문 퍼널은 initialActivity가 이미 프로필이므로 push할 것이 없다.
let profilePushed = getUserIdentity() !== null

export function OnboardingFlow({
  showProfileStep,
  ...contextValue
}: OnboardingContextValue & { showProfileStep: boolean }) {
  useEffect(() => {
    if (showProfileStep && !profilePushed) {
      profilePushed = true
      onboardingActions.push('OnboardingProfile', {})
    }
  }, [showProfileStep])

  return (
    <OnboardingContext.Provider value={contextValue}>
      <StackViewport>
        <OnboardingStack />
      </StackViewport>
    </OnboardingContext.Provider>
  )
}
