import { AppScreen } from '@stackflow/plugin-basic-ui'
import { useFlow, useStepFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { cn } from '@/lib/utils'
import type { PersonView } from '@/stackflow/stackflow.config'

// 기존 /people/:id ↔ /people/:id/timeline 은 서로를 push해 히스토리를 오염시켰다.
// 여기서는 한 activity 안의 step(replaceStep)이라 토글해도 히스토리가 늘지 않는다.
export const PersonActivity: ActivityComponentType<'Person'> = ({ params }) => {
  const view: PersonView = params.view ?? 'profile'
  const { replaceStep } = useStepFlow('Person')
  const { push } = useFlow()

  const setView = (next: PersonView) =>
    replaceStep((prev) => ({ ...prev, view: next }))

  return (
    <AppScreen appBar={{ title: `인물 #${params.personId}` }}>
      <div className="mx-auto max-w-md space-y-4 bg-background px-5 py-4">
        <div className="flex gap-1 rounded-xl bg-muted/40 p-1">
          {(
            [
              ['profile', '프로필'],
              ['timeline', '타임라인'],
            ] as const
          ).map(([key, label]) => (
            <button
              key={key}
              type="button"
              onClick={() => setView(key)}
              className={cn(
                'flex-1 rounded-lg py-2.5 text-[13px] font-extrabold transition-colors',
                view === key
                  ? 'bg-foreground text-background shadow-sm'
                  : 'text-muted-foreground',
              )}
            >
              {label}
            </button>
          ))}
        </div>

        {view === 'profile' ? (
          <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
              인물 프로필 자리 (기존 people/$personId.index.tsx)
            </p>
            <button
              type="button"
              onClick={() => push('Record', { personId: params.personId })}
              className="w-full rounded-xl bg-primary py-3 text-sm font-extrabold text-primary-foreground"
            >
              이 사람과의 기록 남기기 → Record push (사람 프리셋)
            </button>
          </section>
        ) : (
          <section className="space-y-3">
            <p className="text-sm text-muted-foreground">
              인물 타임라인 자리 (기존 people/$personId.timeline.tsx)
            </p>
            <button
              type="button"
              onClick={() => push('EventDetail', { eventId: '42' })}
              className="w-full rounded-xl border border-border py-3 text-sm font-bold"
            >
              타임라인 카드 → 이벤트 상세 push
            </button>
          </section>
        )}
      </div>
    </AppScreen>
  )
}
