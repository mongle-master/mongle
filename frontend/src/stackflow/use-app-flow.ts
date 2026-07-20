import { useFlow } from '@stackflow/react'
import type { Actions } from '@stackflow/react'
import {
  canPostNativeNavigation,
  postNativeNavigation,
} from '@/lib/native-navigation-bridge'
import { activityUrl } from '@/stackflow/activity-url'
import type { AppActivityName } from '@/stackflow/activity-url'

type NativeActions = Pick<Actions, 'pop'> & {
  push: <TActivityName extends AppActivityName>(
    activityName: TActivityName,
    activityParams: Parameters<typeof activityUrl<TActivityName>>[1],
    options?: { animate?: boolean },
  ) => { activityId: string }
  replace: <TActivityName extends AppActivityName>(
    activityName: TActivityName,
    activityParams: Parameters<typeof activityUrl<TActivityName>>[1],
    options?: { animate?: boolean; activityId?: string },
  ) => { activityId: string }
}

let nextNativeActivityId = 0

function nativeActivityId(): string {
  nextNativeActivityId += 1
  return `native-${Date.now()}-${nextNativeActivityId}`
}

export function useAppFlow(): NativeActions {
  const flow = useFlow()

  if (!canPostNativeNavigation()) return flow

  return {
    push(activityName, activityParams) {
      postNativeNavigation({
        type: 'STACK_PUSH',
        url: activityUrl(activityName, activityParams),
      })
      return { activityId: nativeActivityId() }
    },
    replace(activityName, activityParams, options) {
      postNativeNavigation({
        type: 'STACK_REPLACE',
        url: activityUrl(activityName, activityParams),
      })
      return { activityId: options?.activityId ?? nativeActivityId() }
    },
    pop(countOrOptions?: number | { animate?: boolean }) {
      postNativeNavigation({
        type: 'STACK_POP',
        count: typeof countOrOptions === 'number' ? countOrOptions : 1,
      })
    },
  }
}
