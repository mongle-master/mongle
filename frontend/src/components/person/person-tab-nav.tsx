import { ListGroupInset } from '@/components/ui/list-group'
import { SegmentedControl } from '@/components/ui/segmented-control'
import type { PersonView } from '@/stackflow/stackflow.config'

// 프로필↔타임라인은 화면 push가 아니라 Person activity 안의 step 전환이다.
// (토글할 때마다 히스토리가 쌓이던 구 라우트 구조를 대체)
export function PersonTabNav({
  active,
  onSelect,
}: {
  active: PersonView
  onSelect: (view: PersonView) => void
}) {
  return (
    <ListGroupInset className="bg-muted/40 p-1 dark:bg-muted/25">
      <SegmentedControl
        value={active}
        onValueChange={onSelect}
        options={[
          { value: 'profile', label: '프로필' },
          { value: 'timeline', label: '타임라인' },
        ]}
      />
    </ListGroupInset>
  )
}
