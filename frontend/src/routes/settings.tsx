import { createFileRoute } from '@tanstack/react-router'
import { Moon, Sun } from 'lucide-react'
import { AppShell } from '@/components/layout/app-shell'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { useTheme } from '@/components/theme-provider'

export const Route = createFileRoute('/settings')({
  component: SettingsPage,
})

function SettingsPage() {
  const { theme, toggleTheme } = useTheme()

  return (
    <AppShell activePath="/settings">
      <h1 className="text-[22px] font-extrabold tracking-tight">설정</h1>

      <Card className="mt-6 p-4">
        <div className="flex items-center justify-between gap-4">
          <div>
            <p className="font-extrabold">테마</p>
            <p className="text-sm text-muted-foreground">
              {theme === 'dark' ? '다크 모드' : '라이트 모드'}
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={toggleTheme}
            aria-label="테마 전환"
          >
            {theme === 'dark' ? <Sun /> : <Moon />}
          </Button>
        </div>
      </Card>
    </AppShell>
  )
}
