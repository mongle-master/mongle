import { useStepFlow } from '@stackflow/react'
import { useAppFlow } from '@/stackflow/use-app-flow'
import type { ActivityComponentType } from '@stackflow/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PersonPageHeader } from '@/components/person/person-page-header'
import {
  fadeVariants,
  slideVariants,
  stepTransition,
  useStepSlideDirection,
} from '@/components/ui/step-slide'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { PersonProfileView } from '@/stackflow/activities/person/person-profile-view'
import { PersonTimelineView } from '@/stackflow/activities/person/person-timeline-view'
import type { PersonView } from '@/stackflow/stackflow.config'

const VIEW_ORDER: readonly PersonView[] = ['profile', 'timeline']

// 프로필↔타임라인은 한 activity 안의 step 전환(URL `?view=`)이라
// 토글해도 히스토리가 쌓이지 않는다. 구 /people/:id ↔ /people/:id/timeline 상호 push를 대체.
// 헤더(뒤로가기+탭)는 activity에 고정하고 그 아래 콘텐츠만 탭 순서 방향으로 밀어낸다.
export const PersonActivity: ActivityComponentType<'Person'> = ({ params }) => {
  const view: PersonView = params.view === 'timeline' ? 'timeline' : 'profile'
  const { pop } = useAppFlow()
  const { replaceStep } = useStepFlow('Person')
  const reducedMotion = useReducedMotion()
  const direction = useStepSlideDirection(view, VIEW_ORDER)

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
      <PersonPageHeader
        active={view}
        onSelectView={handleSelectView}
        onBack={() => pop()}
      />
      <div className="relative min-h-0 min-w-0 flex-1 overflow-x-clip">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={view}
            custom={direction}
            variants={reducedMotion ? fadeVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={stepTransition(reducedMotion)}
            className="absolute inset-0 flex min-w-0 flex-col"
          >
            {view === 'profile' ? (
              <PersonProfileView
                personId={params.personId}
                onSelectView={handleSelectView}
              />
            ) : (
              <PersonTimelineView personId={params.personId} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>
    </ActivityShell>
  )
}
