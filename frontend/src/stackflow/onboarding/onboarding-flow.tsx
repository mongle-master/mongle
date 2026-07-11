import { useEffect, useRef } from 'react'
import { defineConfig } from '@stackflow/config'
import { stackflow } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { basicUIPlugin } from '@stackflow/plugin-basic-ui'
import { activityComponents } from '@/stackflow/activity-components'
import { StackViewport } from '@/stackflow/components/stack-viewport'
import { OnboardingContext } from '@/stackflow/onboarding/onboarding-context'
import type { OnboardingContextValue } from '@/stackflow/onboarding/onboarding-context'
import { getUserIdentity } from '@/lib/user-identity'

// basic-ui CSS는 앱 스택(stackflow.ts)에서도 import하지만, 그 모듈은 인증 후
// 라우트 청크에서야 로드된다. 온보딩이 먼저 뜨므로 여기서도 반드시 불러와야
// AppScreen의 absolute 겹침 배치·전환 스타일이 적용된다.
import '@stackflow/plugin-basic-ui/index.css'

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

export function OnboardingFlow({
  showProfileStep,
  ...contextValue
}: OnboardingContextValue & { showProfileStep: boolean }) {
  // false→true "전이"에만 push한다.
  // - 재방문 퍼널: 첫 렌더부터 true지만 initialActivity가 이미 프로필이라 push 불필요
  // - 프로필에서 이름 단계로 pop한 뒤: true가 유지될 뿐 전이가 아니므로 재push 없음
  // - 이름 재제출: 새 identity 인증(loading, false) → profile(true) 전이 → 다시 push
  const prevShowProfileStep = useRef(showProfileStep)
  useEffect(() => {
    const wasShowing = prevShowProfileStep.current
    prevShowProfileStep.current = showProfileStep
    if (showProfileStep && !wasShowing) {
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
