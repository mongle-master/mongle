import { Suspense, lazy, useEffect, useState } from 'react'
import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { AuthStatusScreen } from './components/auth/auth-status-screen'
import { getRouter } from './router'
import { queryClient } from './lib/query-client'
import {
  authenticateUser,
  completeUserProfile,
  seedCurrentUser,
} from './lib/api/auth'
import type { UserProfileInput } from './lib/api/auth'
import { createUserIdentity, getUserIdentity } from './lib/user-identity'
import type { UserIdentity } from './lib/user-identity'
import { installBrowserNavTransitionSkip } from './stackflow/browser-nav-transition'

// 온보딩 퍼널은 신규 방문에만 필요하므로, 프로필 설정을 마친 재방문에서는
// 스택 번들을 아예 로드하지 않도록 lazy로 가른다.
const OnboardingFlow = lazy(() =>
  import('./stackflow/onboarding/onboarding-flow').then((m) => ({
    default: m.OnboardingFlow,
  })),
)

installBrowserNavTransitionSkip()

const router = getRouter()
const rootElement = document.getElementById('app')!

function AppBootstrap() {
  const [identity, setIdentity] = useState<UserIdentity | null>(() =>
    getUserIdentity(),
  )
  const [attempt, setAttempt] = useState(0)
  const [authState, setAuthState] = useState<
    'idle' | 'loading' | 'profile' | 'ready' | 'error'
  >(identity ? 'loading' : 'idle')
  // 이 세션에서 이름 단계를 거쳤는지 — 거쳤다면 로딩·에러도 퍼널 화면 안에서 처리한다
  const [inFunnel, setInFunnel] = useState(!identity)

  useEffect(() => {
    if (!identity) return

    let cancelled = false
    setAuthState('loading')
    void authenticateUser(identity)
      .then(async ({ profileSetupCompleted }) => {
        if (!profileSetupCompleted) {
          if (!cancelled) setAuthState('profile')
          return
        }
        await seedCurrentUser()
        if (!cancelled) setAuthState('ready')
      })
      .catch(() => {
        if (!cancelled) setAuthState('error')
      })

    return () => {
      cancelled = true
    }
  }, [attempt, identity])

  if (authState === 'ready') {
    return (
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>
    )
  }

  // 온보딩 퍼널(이름 → 프로필)은 앱과 동일한 스택 내비게이션으로 진행한다.
  // 프로필 미완 재방문도 퍼널(2단계)에서 이어간다.
  if (
    !identity ||
    authState === 'profile' ||
    (inFunnel && authState !== 'error')
  ) {
    const completeProfile = async (profile: UserProfileInput) => {
      await completeUserProfile(profile)
      await seedCurrentUser()
      setAuthState('ready')
    }

    return (
      <Suspense fallback={null}>
        <OnboardingFlow
          username={identity?.username ?? null}
          authenticating={authState === 'loading'}
          showProfileStep={authState === 'profile'}
          onSubmitName={(username) => {
            setInFunnel(true)
            setIdentity(createUserIdentity(username))
          }}
          onCompleteProfile={completeProfile}
        />
      </Suspense>
    )
  }

  // 재방문 인증 로딩·실패 (퍼널 화면이 필요 없는 경로)
  return (
    <AuthStatusScreen
      username={identity.username}
      error={authState === 'error'}
      onRetry={() => setAttempt((value) => value + 1)}
    />
  )
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(<AppBootstrap />)
}
