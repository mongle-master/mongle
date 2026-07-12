import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { useState } from 'react'
import { HomePeriodToggle } from '@/components/home/period-toggle'
import { SettingsPageHeader } from '@/components/settings/settings-page-header'
import { getDefaultHomePeriod, setDefaultHomePeriod } from '@/lib/home-period'
import type { HomePeriod } from '@/lib/home-period'
import { ActivityShell } from '@/stackflow/components/activity-shell'
import { featureEvents, trackFeature } from '@/lib/analytics'

export const HomeSettingsActivity: ActivityComponentType<
  'HomeSettings'
> = () => {
  const { pop } = useFlow()
  const [period, setPeriod] = useState<HomePeriod>(() => getDefaultHomePeriod())

  const handleChange = (next: HomePeriod) => {
    if (next === period) return
    setPeriod(next)
    setDefaultHomePeriod(next)
    void trackFeature(featureEvents.homeDefaultPeriodChanged, { period: next })
  }

  return (
    <ActivityShell layout="fixed">
      <SettingsPageHeader title="홈 설정" onBack={() => pop()} />
      <div className="min-h-0 flex-1 overflow-y-auto pb-8">
        <p className="mb-1 text-[15px] font-extrabold text-foreground">
          기본으로 보여줄 기간
        </p>
        <p className="mb-4 text-xs font-medium text-muted-foreground">
          관계도에 처음 보이는 사람 범위를 정해요
        </p>
        <HomePeriodToggle value={period} onChange={handleChange} />
      </div>
    </ActivityShell>
  )
}
