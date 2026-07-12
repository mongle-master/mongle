import { useMutation } from '@tanstack/react-query'
import { useFlow } from '@stackflow/react'
import { RotateCcw } from 'lucide-react'
import { useState } from 'react'
import { MongleLogo } from '@/components/brand/mongle-logo'
import { SettingsNavigationItem } from '@/components/settings/settings-navigation-item'
import { useTheme } from '@/components/theme-provider'
import { Button } from '@/components/ui/button'
import { ConfirmPopup } from '@/components/ui/confirm-popup'
import {
  ListGroup,
  ListGroupItem,
  ListGroupLabel,
} from '@/components/ui/list-group'
import { Switch } from '@/components/ui/switch'
import { userMutation } from '@/apis/mutations'
import { resetAnalytics } from '@/lib/analytics'
import { clearToken } from '@/lib/auth-token'
import { clearUserIdentity } from '@/lib/user-identity'
import { TabShell } from '@/stackflow/components/tab-shell'

export function SettingsTab() {
  const { push } = useFlow()
  const { theme, setTheme } = useTheme()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const resetMutation = useMutation({
    ...userMutation.removeCurrent(),
    onSuccess: () => {
      resetAnalytics()
      clearToken()
      clearUserIdentity()
      window.location.replace('/')
    },
  })

  const handleDarkModeChange = (checked: boolean) => {
    setTheme(checked ? 'dark' : 'light')
  }

  return (
    <TabShell layout="fixed">
      <header className="shrink-0 pb-4">
        <MongleLogo className="mb-5 text-foreground" />
        <h1 className="text-[22px] font-black leading-tight tracking-tight text-foreground">
          설정
        </h1>
      </header>

      <div className="min-h-0 min-w-0 flex-1 space-y-6 overflow-y-auto pb-24 [scrollbar-gutter:stable] [-webkit-overflow-scrolling:touch]">
        <ListGroup>
          <SettingsNavigationItem
            label="홈 설정"
            onClick={() => push('HomeSettings', {})}
          />
          <SettingsNavigationItem
            label="태그 설정"
            withDivider={false}
            onClick={() => push('TagSettings', {})}
          />
        </ListGroup>

        <section>
          <ListGroupLabel>화면</ListGroupLabel>
          <ListGroup>
            <ListGroupItem withDivider={false}>
              <div className="flex min-h-9 items-center justify-between gap-4">
                <span className="text-[15px] font-extrabold text-foreground">
                  다크 모드
                </span>
                <Switch
                  checked={theme === 'dark'}
                  onCheckedChange={handleDarkModeChange}
                  aria-label="다크 모드"
                />
              </div>
            </ListGroupItem>
          </ListGroup>
        </section>

        <section>
          <ListGroupLabel>테스트</ListGroupLabel>
          <ListGroup>
            <ListGroupItem withDivider={false}>
              <div className="flex items-center justify-between gap-4">
                <div>
                  <p className="text-[15px] font-extrabold text-foreground">
                    테스트 사용자 초기화
                  </p>
                  <p className="mt-1 text-xs font-medium text-muted-foreground">
                    새 사용자 흐름을 처음부터 확인해요
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  disabled={resetMutation.isPending}
                  onClick={() => setConfirmOpen(true)}
                  className="h-9 shrink-0 rounded-full px-3 font-extrabold"
                >
                  <RotateCcw className="size-3.5" />
                  초기화
                </Button>
              </div>
              {resetMutation.isError ? (
                <p className="mt-3 text-xs font-bold text-destructive">
                  초기화하지 못했어요. 잠시 후 다시 시도해 주세요.
                </p>
              ) : null}
            </ListGroupItem>
          </ListGroup>
        </section>

        <section>
          <ListGroupLabel>정보</ListGroupLabel>
          <ListGroup>
            <ListGroupItem withDivider={false}>
              <div className="flex items-center justify-between">
                <span className="text-[15px] font-extrabold text-foreground">
                  Mongle
                </span>
                <span className="text-xs font-bold text-muted-foreground">
                  MVP
                </span>
              </div>
            </ListGroupItem>
          </ListGroup>
        </section>
      </div>

      <ConfirmPopup
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title="테스트 사용자를 초기화할까요?"
        description="현재 사용자를 삭제하고 이름 입력 화면부터 다시 시작해요."
        error={
          resetMutation.isError
            ? '초기화하지 못했어요. 잠시 후 다시 시도해 주세요.'
            : undefined
        }
        confirmLabel="초기화"
        destructive
        pending={resetMutation.isPending}
        onConfirm={() => resetMutation.mutate()}
      />
    </TabShell>
  )
}
