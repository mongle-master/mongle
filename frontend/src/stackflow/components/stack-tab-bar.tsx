import { useFlow, useStepFlow } from '@stackflow/react'
import { Clock, Home, Plus, Settings, Users } from 'lucide-react'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { cn } from '@/lib/utils'
import type { MainTab } from '@/stackflow/stackflow.config'

const tabs: Array<{ tab: MainTab; label: string; icon: typeof Home }> = [
  { tab: 'home', label: '홈', icon: Home },
  { tab: 'timeline', label: '몽글라인', icon: Clock },
  { tab: 'people', label: '사람', icon: Users },
  { tab: 'settings', label: '설정', icon: Settings },
]

// 모바일은 하단 탭, PC는 좌측 내비게이션으로 표시한다. 둘 다 같은
// replaceStep을 사용하므로 히스토리와 탭 상태 보존 계약은 바뀌지 않는다.
export function StackTabBar({ activeTab }: { activeTab: MainTab }) {
  const { replaceStep } = useStepFlow('Main')
  const { push } = useFlow()

  const items = [
    ...tabs.slice(0, 2).map((t) => ({ kind: 'tab' as const, ...t })),
    { kind: 'fab' as const },
    ...tabs.slice(2).map((t) => ({ kind: 'tab' as const, ...t })),
  ]

  return (
    <nav className="absolute right-0 bottom-0 left-0 z-50 border-t border-border bg-background lg:static lg:h-full lg:w-60 lg:shrink-0 lg:border-t-0 lg:border-r lg:bg-card/85 lg:backdrop-blur-xl">
      <div className="mx-auto flex h-[calc(4.75rem+env(safe-area-inset-bottom))] max-w-md items-end justify-around px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))] lg:hidden">
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
              aria-current={activeTab === item.tab ? 'page' : undefined}
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-bold',
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

      <div className="hidden h-full flex-col px-4 py-7 lg:flex">
        <MongleLogo
          className="px-3 text-foreground"
          iconClassName="size-7"
          textClassName="text-base"
        />

        <div className="mt-10 space-y-1.5">
          {items.map((item) => {
            if (item.kind === 'fab') {
              return (
                <button
                  key="record"
                  type="button"
                  onClick={() => push('Record', {})}
                  className="flex h-11 w-full items-center justify-center gap-2 rounded-xl border border-foreground bg-background text-sm font-extrabold text-foreground shadow-sm transition-colors hover:bg-foreground hover:text-background"
                >
                  <Plus className="size-[1.125rem]" />
                  기록 작성
                </button>
              )
            }

            const Icon = item.icon
            const isActive = activeTab === item.tab

            return (
              <button
                key={item.tab}
                type="button"
                onClick={() => replaceStep({ tab: item.tab })}
                aria-current={isActive ? 'page' : undefined}
                className={cn(
                  'flex h-11 w-full items-center gap-3 rounded-xl px-3 text-sm font-extrabold transition-colors',
                  isActive
                    ? 'bg-foreground text-background shadow-sm'
                    : 'text-muted-foreground hover:bg-muted hover:text-foreground',
                )}
              >
                <Icon className="size-[1.125rem]" />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>
    </nav>
  )
}
