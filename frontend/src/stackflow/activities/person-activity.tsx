import { useStepFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { PersonProfileView } from '@/stackflow/activities/person/person-profile-view'
import { PersonTimelineView } from '@/stackflow/activities/person/person-timeline-view'
import type { PersonView } from '@/stackflow/stackflow.config'

// 프로필↔타임라인은 한 activity 안의 step 전환(URL `?view=`)이라
// 토글해도 히스토리가 쌓이지 않는다. 구 /people/:id ↔ /people/:id/timeline 상호 push를 대체.
export const PersonActivity: ActivityComponentType<'Person'> = ({ params }) => {
  const view: PersonView = params.view === 'timeline' ? 'timeline' : 'profile'
  const { replaceStep } = useStepFlow('Person')

  const handleSelectView = (next: PersonView) => {
    if (next === view) return
    // 기본 view(프로필)는 쿼리를 남기지 않는다 (`/people/1?view=profile` 방지)
    replaceStep((prev) => ({
      ...prev,
      view: next === 'profile' ? undefined : next,
    }))
  }

  return (
    <ActivityShell layout="fixed">
      {view === 'profile' ? (
        <PersonProfileView
          personId={params.personId}
          onSelectView={handleSelectView}
        />
      ) : (
        <PersonTimelineView
          personId={params.personId}
          onSelectView={handleSelectView}
        />
      )}
    </ActivityShell>
  )
}
