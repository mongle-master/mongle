import { useRef } from 'react'
import { useStepFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { AnimatePresence, motion, useReducedMotion } from 'motion/react'
import { PersonPageHeader } from '@/components/person/person-page-header'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { PersonProfileView } from '@/stackflow/activities/person/person-profile-view'
import { PersonTimelineView } from '@/stackflow/activities/person/person-timeline-view'
import type { PersonView } from '@/stackflow/stackflow.config'

const VIEW_ORDER: readonly PersonView[] = ['profile', 'timeline']

// motion의 x 단축 prop은 메인 스레드(rAF)에서 돌아 로딩 중 프레임이 떨어진다.
// transform 문자열이어야 하드웨어 가속 경로를 탄다.
const slideVariants = {
  enter: (direction: number) => ({
    transform: `translateX(${direction * 100}%)`,
  }),
  center: { transform: 'translateX(0%)' },
  exit: (direction: number) => ({
    transform: `translateX(${direction * -100}%)`,
  }),
}

const fadeVariants = {
  enter: { opacity: 0 },
  center: { opacity: 1 },
  exit: { opacity: 0 },
}

// 프로필↔타임라인은 한 activity 안의 step 전환(URL `?view=`)이라
// 토글해도 히스토리가 쌓이지 않는다. 구 /people/:id ↔ /people/:id/timeline 상호 push를 대체.
// stackflow 전환은 activity push/pop에만 붙으므로 step 전환의 슬라이드는 여기서 직접 그린다.
// 헤더(뒤로가기+탭)는 activity에 고정하고 그 아래 콘텐츠만 탭 순서 방향으로 밀어낸다.
export const PersonActivity: ActivityComponentType<'Person'> = ({ params }) => {
  const view: PersonView = params.view === 'timeline' ? 'timeline' : 'profile'
  const { replaceStep } = useStepFlow('Person')
  const reducedMotion = useReducedMotion()

  // 이전 view와의 탭 순서 비교로 슬라이드 방향을 정한다 (오른쪽 탭으로 갈수록 왼쪽으로 밀림)
  const lastViewRef = useRef(view)
  const directionRef = useRef(1)
  if (lastViewRef.current !== view) {
    directionRef.current =
      VIEW_ORDER.indexOf(view) > VIEW_ORDER.indexOf(lastViewRef.current)
        ? 1
        : -1
    lastViewRef.current = view
  }
  const direction = directionRef.current

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
      <PersonPageHeader active={view} onSelectView={handleSelectView} />
      <div className="relative min-h-0 min-w-0 flex-1 overflow-x-clip">
        <AnimatePresence initial={false} custom={direction}>
          <motion.div
            key={view}
            custom={direction}
            variants={reducedMotion ? fadeVariants : slideVariants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={
              reducedMotion
                ? { duration: 0.15 }
                : { duration: 0.3, ease: [0.32, 0.72, 0, 1] }
            }
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
