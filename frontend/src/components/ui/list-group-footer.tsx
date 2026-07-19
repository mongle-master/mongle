export function ListGroupFooter({ children }: { children: React.ReactNode }) {
  return (
    <p className="mt-2 px-3 text-caption font-medium leading-relaxed text-muted-foreground">
      {children}
    </p>
  )
}
