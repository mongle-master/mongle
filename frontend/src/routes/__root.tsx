import { Outlet, createRootRouteWithContext } from '@tanstack/react-router'
import { TanStackRouterDevtoolsPanel } from '@tanstack/react-router-devtools'
import { TanStackDevtools } from '@tanstack/react-devtools'
import type { QueryClient } from '@tanstack/react-query'
import { ThemeProvider } from '@/components/theme-provider'
import { DUMMY_DATA_MODE } from '@/lib/dummy-mode'

import '../styles.css'

export const Route = createRootRouteWithContext<{
  queryClient: QueryClient
}>()({
  component: RootComponent,
})

function RootComponent() {
  return (
    <ThemeProvider>
      <Outlet />
      {DUMMY_DATA_MODE ? (
        // 더미 데이터를 실데이터로 오인하지 않도록 항상 노출한다(mustpass/dummy-data-mode.md §7).
        <div className="pointer-events-none fixed top-2 left-1/2 z-50 -translate-x-1/2 rounded-full bg-amber-500/90 px-3 py-1 text-xs font-semibold text-white">
          더미 데이터 모드
        </div>
      ) : null}
      <TanStackDevtools
        config={{ position: 'bottom-right' }}
        plugins={[
          {
            name: 'TanStack Router',
            render: <TanStackRouterDevtoolsPanel />,
          },
        ]}
      />
    </ThemeProvider>
  )
}
