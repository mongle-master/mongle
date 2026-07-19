export function ListGroupLabel({ children }: { children: React.ReactNode }) {
  return (
    <p className="mb-2 px-3 text-caption font-extrabold tracking-wide text-muted-foreground uppercase">
      {children}
    </p>
  )
}
