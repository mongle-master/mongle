export function TimelineFilterReset({
  visible,
  onReset,
}: {
  visible: boolean
  onReset: () => void
}) {
  if (!visible) return null

  return (
    <button
      type="button"
      onClick={onReset}
      className="mt-1 inline-flex h-8 items-center rounded-full bg-muted px-3 text-xs font-extrabold text-muted-foreground transition-colors hover:bg-muted/70 hover:text-foreground"
    >
      필터 초기화
    </button>
  )
}
