import { Link } from '@tanstack/react-router'
import { Clock, Home, Plus, Settings, Users } from 'lucide-react'
import { cn } from '@/lib/utils'

type TabItem =
  | { kind: 'link'; to: string; label: string; icon: typeof Home }
  | { kind: 'fab'; to: '/record' }

const tabs: TabItem[] = [
  { kind: 'link', to: '/', label: '홈', icon: Home },
  { kind: 'link', to: '/timeline', label: '타임라인', icon: Clock },
  { kind: 'fab', to: '/record' },
  { kind: 'link', to: '/people', label: '사람', icon: Users },
  { kind: 'link', to: '/settings', label: '설정', icon: Settings },
]

export function BottomNav({ activePath }: { activePath: string }) {
  return (
    <nav className="fixed right-0 bottom-0 left-0 z-50 border-t border-border bg-background">
      <div className="mx-auto flex h-[calc(4.75rem+env(safe-area-inset-bottom))] max-w-md items-end justify-around px-2 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
        {tabs.map((tab) => {
          if (tab.kind === 'fab') {
            return (
              <Link
                key="record"
                to="/record"
                search={{ personId: undefined, eventId: undefined }}
                className="-mt-5 flex size-12 items-center justify-center rounded-full bg-primary text-primary-foreground shadow-lg"
              >
                <Plus className="size-6" />
              </Link>
            )
          }

          const isActive =
            activePath !== '/record' &&
            (tab.to === '/'
              ? activePath === '/'
              : activePath.startsWith(tab.to))

          const Icon = tab.icon
          return (
            <Link
              key={tab.to}
              to={tab.to}
              className={cn(
                'flex flex-col items-center gap-1 text-[11px] font-bold',
                isActive ? 'text-foreground' : 'text-muted-foreground',
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}
