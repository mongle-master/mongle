import ReactDOM from 'react-dom/client'
import { RouterProvider } from '@tanstack/react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { getRouter } from './router'
import { queryClient } from './lib/query-client'
import { ensureDemoAuth } from './lib/api/auth'

const router = getRouter()
const rootElement = document.getElementById('app')!

async function bootstrap() {
  try {
    await ensureDemoAuth()
  } catch {
    // 백엔드 미기동 시에도 UI는 띄운다
  }

  if (!rootElement.innerHTML) {
    ReactDOM.createRoot(rootElement).render(
      <QueryClientProvider client={queryClient}>
        <RouterProvider router={router} />
      </QueryClientProvider>,
    )
  }
}

void bootstrap()
