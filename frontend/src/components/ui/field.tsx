// label을 키우고 볼드는 뺀다.
export function Field({
  label,
  children,
}: {
  label: string
  children: React.ReactNode
}) {
  return (
    <section>
      <p className="mb-2.5 text-lg text-muted-foreground">{label}</p>
      {children}
    </section>
  )
}
