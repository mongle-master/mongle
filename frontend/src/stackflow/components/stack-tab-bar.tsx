import { useFlow, useStepFlow } from '@stackflow/react'
import { Clock, Home, Plus, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { MainTab } from '@/stackflow/stackflow.config'

const tabs: Array<{ tab: MainTab; label: string; icon: typeof Home }> = [
  { tab: 'home', label: '홈', icon: Home },
  { tab: 'timeline', label: '몽글라인', icon: Clock },
  { tab: 'people', label: '사람', icon: Users },
  { tab: 'settings', label: '설정', icon: Settings },
]

// BottomNav(components/layout/bottom-nav.tsx)의 스택 버전.
// 탭 전환은 push가 아니라 replaceStep이라 히스토리가 쌓이지 않고,
// Main activity가 언마운트되지 않으므로 탭 상태가 보존된다.
export function StackTabBar({ activeTab }: { activeTab: MainTab }) {
  const { replaceStep } = useStepFlow('Main')
  const { push } = useFlow()

  const items = [
    ...tabs.slice(0, 2).map((t) => ({ kind: 'tab' as const, ...t })),
    { kind: 'fab' as const },
    ...tabs.slice(2).map((t) => ({ kind: 'tab' as const, ...t })),
  ]

  return (
    <nav className="absolute right-0 bottom-0 left-0 z-50 border-t border-border bg-background">
      <div className="mx-auto flex h-[calc(4.75rem+env(safe-area-inset-bottom))] max-w-md items-end justify-around px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {items.map((item) => {
          if (item.kind === 'fab') {
            return (
              <button
                key="record"
                type="button"
                onClick={() => push('Record', {})}
                className="-mt-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
                aria-label="기록 작성"
              >
                <Plus className="size-6" />
              </button>
            )
          }

          const Icon = item.icon
          return (
            <button
              key={item.tab}
              type="button"
              onClick={() => replaceStep({ tab: item.tab })}
              className={cn(
                'flex flex-col items-center gap-1 text-caption font-bold',
                activeTab === item.tab
                  ? 'text-foreground'
                  : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {item.label}
            </button>
          )
        })}
      </div>
    </nav>
  )
}
