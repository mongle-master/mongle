import { AppScreen } from '@stackflow/plugin-basic-ui'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'

export const NotFoundActivity: ActivityComponentType<'NotFound'> = () => {
  const { replace } = useFlow()

  return (
    <AppScreen appBar={{ title: '없는 페이지' }}>
      <div className="mx-auto max-w-md space-y-4 bg-background px-5 py-10 text-center">
        <p className="text-sm text-muted-foreground">잘못된 경로예요.</p>
        <button
          type="button"
          onClick={() => replace('Main', { tab: 'home' })}
          className="rounded-xl border border-border px-4 py-2 text-sm font-bold"
        >
          홈으로
        </button>
      </div>
    </AppScreen>
  )
}
