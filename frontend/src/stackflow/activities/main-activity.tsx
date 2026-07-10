import { useState } from 'react'
import { AppScreen } from '@stackflow/plugin-basic-ui'
import { useFlow } from '@stackflow/react'
import type { ActivityComponentType } from '@stackflow/react'
import { ChevronRight } from 'lucide-react'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { StackTabBar } from '@/stackflow/components/stack-tab-bar'
import { cn } from '@/lib/utils'

// 데모용 더미. 실제 이전 시 각 탭에 기존 화면(routes/*)이 들어온다.
const DEMO_PEOPLE = [
  { id: '1', name: '지수' },
  { id: '2', name: '하늘' },
  { id: '3', name: '민준' },
]
const DEMO_EVENTS = [
  { id: '42', title: '한강 피크닉', person: '지수' },
  { id: '43', title: '점심 회고', person: '하늘' },
]

export const MainActivity: ActivityComponentType<'Main'> = ({ params }) => {
  const tab = params.tab

  return (
    <AppScreen>
      <div className="relative mx-auto flex h-full max-w-md flex-col bg-background">
        <main className="min-h-0 flex-1 overflow-y-auto px-5 pt-[max(1.5rem,env(safe-area-inset-top))] pb-[calc(5.75rem+env(safe-area-inset-bottom))]">
          {/* 탭을 hidden으로 유지해 전환 시 상태(스크롤·입력·필터)가 살아있음을 검증한다 */}
          <div hidden={tab !== 'home'}>
            <HomeTab />
          </div>
          <div hidden={tab !== 'timeline'}>
            <TimelineTab />
          </div>
          <div hidden={tab !== 'people'}>
            <PeopleTab />
          </div>
          <div hidden={tab !== 'settings'}>
            <SettingsTab />
          </div>
        </main>
        <StackTabBar activeTab={tab} />
      </div>
    </AppScreen>
  )
}

function TabHeader({ title }: { title: string }) {
  return (
    <header className="mb-4 flex items-center justify-between">
      <MongleLogo className="h-6" />
      <span className="text-sm font-extrabold text-muted-foreground">
        {title}
      </span>
    </header>
  )
}

function DemoCard({
  onClick,
  children,
  className,
}: {
  onClick?: () => void
  children: React.ReactNode
  className?: string
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex w-full items-center justify-between rounded-xl border border-border bg-card px-4 py-3 text-left text-sm font-bold',
        className,
      )}
    >
      {children}
      <ChevronRight className="size-4 shrink-0 text-muted-foreground" />
    </button>
  )
}

function HomeTab() {
  const { push } = useFlow()

  return (
    <section className="space-y-3">
      <TabHeader title="홈 (자리)" />
      <DemoCard onClick={() => push('EventDetail', { eventId: '42' })}>
        1년 전 오늘 · 한강 피크닉 → 이벤트 상세 push
      </DemoCard>
      {DEMO_PEOPLE.map((p) => (
        <DemoCard key={p.id} onClick={() => push('Person', { personId: p.id })}>
          관계맵 노드 · {p.name} → 인물 push
        </DemoCard>
      ))}
    </section>
  )
}

function TimelineTab() {
  const { push } = useFlow()
  // 탭 전환 후에도 입력이 남아있으면 "탭 상태 보존"이 증명된다
  const [filterDraft, setFilterDraft] = useState('')

  return (
    <section className="space-y-3">
      <TabHeader title="몽글라인 (자리)" />
      <input
        value={filterDraft}
        onChange={(e) => setFilterDraft(e.target.value)}
        placeholder="상태 보존 확인용 입력 — 탭을 갔다 와도 남아있어야 함"
        className="w-full rounded-xl border border-border bg-background px-4 py-3 text-sm"
      />
      {DEMO_EVENTS.map((ev) => (
        <DemoCard
          key={ev.id}
          onClick={() => push('EventDetail', { eventId: ev.id })}
        >
          {ev.person} · {ev.title} → 이벤트 상세 push
        </DemoCard>
      ))}
    </section>
  )
}

function PeopleTab() {
  const { push } = useFlow()

  return (
    <section className="space-y-3">
      <TabHeader title="사람 (자리)" />
      {DEMO_PEOPLE.map((p) => (
        <DemoCard key={p.id} onClick={() => push('Person', { personId: p.id })}>
          {p.name} → 인물 push
        </DemoCard>
      ))}
      <p className="pt-2 text-xs text-muted-foreground">
        사람 추가/수정 폼은 이전 단계에서 PersonForm activity로 들어온다.
      </p>
    </section>
  )
}

function SettingsTab() {
  return (
    <section className="space-y-3">
      <TabHeader title="설정 (자리)" />
      <p className="text-sm text-muted-foreground">
        설정 화면 자리. 칩 관리 등 기존 /settings 화면이 이 탭으로 이전된다.
      </p>
    </section>
  )
}
