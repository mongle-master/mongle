// PC에서도 모바일 폭(max-w-md) 안에서만 화면이 그려지고 슬라이드되도록
// 스택 전체를 가운데 정렬된 컨테이너에 가둔다.
// (basic-ui 화면은 fixed가 아니라 가장 가까운 positioned 조상 기준 absolute)
export function StackViewport({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative mx-auto h-dvh w-full max-w-md overflow-hidden bg-background sm:border-x sm:border-border">
      {children}
      <div
        id="stack-overlay-root"
        className="pointer-events-none absolute inset-0 z-[var(--z-overlay)]"
      />
    </div>
  )
}
