import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { useEffect, useState } from 'react'
import { AuthStatusScreen } from './components/auth/auth-status-screen'
import { NameOnboarding } from './components/auth/name-onboarding'
import { getRouter } from './router'
import { queryClient } from './lib/query-client'
import { authenticateUser } from './lib/api/auth'
import { createUserIdentity, getUserIdentity } from './lib/user-identity'
import type { UserIdentity } from './lib/user-identity'

const router = getRouter()
const rootElement = document.getElementById('app')!

function AppBootstrap() {
  const [identity, setIdentity] = useState<UserIdentity | null>(() =>
    getUserIdentity(),
  )
  const [attempt, setAttempt] = useState(0)
  const [authState, setAuthState] = useState<
    'idle' | 'loading' | 'ready' | 'error'
  >(identity ? 'loading' : 'idle')

  useEffect(() => {
    if (!identity) return

    let cancelled = false
    setAuthState('loading')
    void authenticateUser(identity)
      .then(() => {
        if (!cancelled) setAuthState('ready')
      })
      .catch(() => {
        if (!cancelled) setAuthState('error')
      })

    return () => {
      cancelled = true
    }
  }, [attempt, identity])

  if (!identity) {
    return (
      <NameOnboarding
        onSubmit={(username) => setIdentity(createUserIdentity(username))}
      />
    )
  }

  if (authState !== 'ready') {
    return (
      <AuthStatusScreen
        username={identity.username}
        error={authState === 'error'}
        onRetry={() => setAttempt((value) => value + 1)}
      />
    )
  }

  return (
    <QueryClientProvider client={queryClient}>
      <RouterProvider router={router} />
    </QueryClientProvider>
  )
}

if (!rootElement.innerHTML) {
  ReactDOM.createRoot(rootElement).render(<AppBootstrap />)
}
