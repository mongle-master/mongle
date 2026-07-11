import { stackflow } from '@stackflow/react'
import { basicRendererPlugin } from '@stackflow/plugin-renderer-basic'
import { basicUIPlugin } from '@stackflow/plugin-basic-ui'
import { historySyncPlugin } from '@stackflow/plugin-history-sync'
import { stackConfig } from '@/stackflow/stackflow.config'
import { MainActivity } from '@/stackflow/activities/main-activity'
import { PersonActivity } from '@/stackflow/activities/person-activity'
import { PersonNewActivity } from '@/stackflow/activities/person-new-activity'
import { PersonEditActivity } from '@/stackflow/activities/person-edit-activity'
import { EventDetailActivity } from '@/stackflow/activities/event-detail-activity'
import { RecordActivity } from '@/stackflow/activities/record-activity'
import { NotFoundActivity } from '@/stackflow/activities/not-found-activity'

import '@stackflow/plugin-basic-ui/index.css'

export const { Stack } = stackflow({
  config: stackConfig,
  components: {
    Main: MainActivity,
    Person: PersonActivity,
    PersonNew: PersonNewActivity,
    PersonEdit: PersonEditActivity,
    EventDetail: EventDetailActivity,
    Record: RecordActivity,
    NotFound: NotFoundActivity,
  },
  plugins: [
    basicRendererPlugin(),
    // cupertino 테마여야 iOS 엣지 스와이프백이 동작한다 (android 테마엔 없음).
    // 색은 앱 테마 변수를 그대로 물려 다크모드를 따라가게 한다.
    basicUIPlugin({
      theme: 'cupertino',
      backgroundColor: 'var(--background)',
      appBar: {
        textColor: 'var(--foreground)',
        iconColor: 'var(--foreground)',
        backgroundColor: 'var(--background)',
        borderColor: 'var(--border)',
      },
    }),
    historySyncPlugin({
      config: stackConfig,
      fallbackActivity: () => 'NotFound',
    }),
  ],
})
