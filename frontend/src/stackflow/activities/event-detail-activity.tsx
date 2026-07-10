import { AppScreen } from '@stackflow/plugin-basic-ui'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'

// 기존 events/$eventId.tsx는 returnTo/returnPersonId search param으로 복귀 경로를
// 수동 계산했다. 스택에서는 어디서 push됐든 뒤로가기 = pop 하나로 끝난다.
export const EventDetailActivity: ActivityComponentType<'EventDetail'> = ({
  params,
}) => {
  const { push } = useFlow()

  return (
    <AppScreen appBar={{ title: `기록 상세 #${params.eventId}` }}>
      <div className="mx-auto max-w-md space-y-4 bg-background px-5 py-4">
        <p className="text-sm text-muted-foreground">
          이벤트 상세 자리 (기존 events/$eventId.tsx)
        </p>
        <button
          type="button"
          onClick={() => push('Record', { eventId: params.eventId })}
          className="w-full rounded-xl border border-border py-3 text-sm font-bold"
        >
          수정 → Record push (이벤트 프리셋)
        </button>
      </div>
    </AppScreen>
  )
}
