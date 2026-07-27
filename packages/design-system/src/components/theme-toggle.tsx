import { Moon, Sun, Monitor } from 'lucide-react'

import { cn } from '@/lib/utils'
import { useTheme } from './theme-provider'
import type { Theme } from './theme-provider'

const options: { value: Theme; icon: typeof Sun; label: string }[] = [
  { value: 'light', icon: Sun, label: '라이트' },
  { value: 'dark', icon: Moon, label: '다크' },
  { value: 'system', icon: Monitor, label: '시스템' },
]

function ThemeToggle({ className }: { className?: string }) {
  const { theme, setTheme } = useTheme()

  return (
    <div
      data-slot="theme-toggle"
      className={cn(
        'inline-flex h-8 items-center gap-0.5 rounded-lg bg-muted p-0.5',
        className,
      )}
    >
      {options.map(({ value, icon: Icon, label }) => (
        <button
          key={value}
          type="button"
          aria-label={label}
          aria-pressed={theme === value}
          onClick={() => setTheme(value)}
          className={cn(
            'flex size-7 items-center justify-center rounded-md text-muted-foreground transition-colors hover:text-foreground',
            theme === value && 'bg-card text-foreground shadow-e1',
          )}
        >
          <Icon className="size-3.5" />
        </button>
      ))}
    </div>
  )
}

export { ThemeToggle }
