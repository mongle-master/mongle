import { AppScreen } from '@stackflow/plugin-basic-ui'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'

// fullScreen 모달 프레젠테이션: 아래 activity(탭 화면)가 언마운트되지 않은 채 위로 덮는다.
// 저장 후 "첫 사람의 타임라인으로 이동"은 pop 후 push가 아니라 replace('Person', ...)로
// 이 activity 자체를 갈아끼우는 방식이 된다 — returnTo 분기가 필요 없어지는 이유.
export const RecordActivity: ActivityComponentType<'Record'> = ({ params }) => {
  const { pop, replace } = useFlow()

  return (
    <AppScreen
      appBar={{
        title: '기록',
        renderRight: () => (
          <button
            type="button"
            onClick={() =>
              params.personId
                ? replace('Person', {
                    personId: params.personId,
                    view: 'timeline',
                  })
                : pop()
            }
            className="px-2 text-[15px] font-extrabold text-foreground"
          >
            저장
          </button>
        ),
      }}
      CUPERTINO_ONLY_modalPresentationStyle="fullScreen"
    >
      <div className="mx-auto max-w-md space-y-4 bg-background px-5 py-4">
        <p className="text-sm text-muted-foreground">
          기록 작성 자리 (기존 record.tsx).
          {params.personId ? ` 사람 프리셋: #${params.personId}` : null}
          {params.eventId ? ` 수정 대상: #${params.eventId}` : null}
        </p>
        <p className="text-xs text-muted-foreground">
          저장(사람 프리셋 있음) = Person 타임라인으로 replace · 없으면 pop.
        </p>
      </div>
    </AppScreen>
  )
}
