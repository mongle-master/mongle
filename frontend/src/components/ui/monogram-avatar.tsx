import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { cn } from '@/lib/utils'
import { mediaUrl } from '@/lib/api/client'
import { monogram } from '@/lib/format'

export function MonogramAvatar({
  name,
  imageUrl,
  className,
  favorite,
}: {
  name: string
  imageUrl?: string | null
  className?: string
  favorite?: boolean
}) {
  const src = mediaUrl(imageUrl)
  return (
    <div className="relative inline-flex shrink-0">
      <Avatar className={cn('border border-border bg-card', className)}>
        {src ? <AvatarImage src={src} alt={name} /> : null}
        <AvatarFallback className="bg-muted font-bold text-foreground">
          {monogram(name)}
        </AvatarFallback>
      </Avatar>
      {favorite ? (
        <span className="absolute -top-1 -right-1 text-xs">★</span>
      ) : null}
    </div>
  )
}
