import { MongleLogo } from '@/components/brand/mongle-logo'
import { Button } from '@/components/ui/button'

export function AuthStatusScreen({
  username,
  error,
  onRetry,
}: {
  username: string
  error: boolean
  onRetry: () => void
}) {
  return (
    <main className="mx-auto flex min-h-dvh max-w-md flex-col bg-background px-6 pb-[max(2rem,env(safe-area-inset-bottom))] pt-[max(2rem,env(safe-area-inset-top))]">
      <MongleLogo className="text-foreground" />
      <div className="my-auto text-center">
        <div
          className="mx-auto mb-7 flex size-20 items-center justify-center rounded-[2rem] bg-primary/10"
          aria-hidden
        >
          <span
            className={
              error
                ? 'text-3xl'
                : 'size-3 animate-pulse rounded-full bg-primary'
            }
          >
            {error ? '!' : null}
          </span>
        </div>
        <h1 className="text-2xl font-black tracking-tight text-foreground">
          {error
            ? '공간을 열지 못했어요'
            : `${username}님의 공간을 준비하고 있어요`}
        </h1>
        <p className="mt-3 text-sm font-medium text-muted-foreground">
          {error
            ? '연결을 확인하고 다시 시도해 주세요.'
            : '관계와 순간을 안전하게 불러오는 중이에요.'}
        </p>
        {error ? (
          <Button
            className="mt-7 rounded-full px-7 font-extrabold"
            onClick={onRetry}
          >
            다시 시도
          </Button>
        ) : null}
      </div>
    </main>
  )
}
