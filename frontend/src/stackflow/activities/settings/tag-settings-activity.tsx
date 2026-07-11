import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { SettingsPageHeader } from '@/components/settings/settings-page-header'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { TagSettingsPage } from '@/stackflow/activities/settings/tag-settings-page'

export const TagSettingsActivity: ActivityComponentType<'TagSettings'> = () => {
  const { pop } = useFlow()

  return (
    <ActivityShell layout="fixed">
      <SettingsPageHeader title="태그 설정" onBack={() => pop()} />
      <TagSettingsPage />
    </ActivityShell>
  )
}
