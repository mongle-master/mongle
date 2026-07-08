import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { mediaUrl } from '@/lib/api/client'
import { defaultPersonImageUrl } from '@/lib/default-person-image'
import type { PersonImageGender } from '@/lib/default-person-image'
import { monogram } from '@/lib/format'
import { cn } from '@/lib/utils'

export function MonogramAvatar({
  name,
  imageUrl,
  className,
  fallbackClassName,
  favoriteClassName,
  useDefaultImage = true,
  favorite,
  gender,
  personId,
}: {
  name: string
  imageUrl?: string | null
  className?: string
  fallbackClassName?: string
  favoriteClassName?: string
  useDefaultImage?: boolean
  favorite?: boolean
  gender?: PersonImageGender
  personId?: number | null
}) {
  const apiSrc = mediaUrl(imageUrl)
  const src =
    apiSrc ??
    (useDefaultImage
      ? defaultPersonImageUrl({
          id: personId,
          name,
          gender,
        })
      : null)

  return (
    <div className="relative inline-flex shrink-0">
      <Avatar className={cn('border border-border bg-card', className)}>
        {src ? (
          <AvatarImage src={src} alt={name} className="object-cover" />
        ) : null}
        <AvatarFallback
          className={cn(
            'bg-muted font-bold text-foreground',
            fallbackClassName,
          )}
        >
          {monogram(name)}
        </AvatarFallback>
      </Avatar>
      {favorite ? (
        <span
          className={cn('absolute -top-1 -right-1 text-xs', favoriteClassName)}
        >
          ★
        </span>
      ) : null}
    </div>
  )
}
