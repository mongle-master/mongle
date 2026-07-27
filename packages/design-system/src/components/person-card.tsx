import * as React from 'react'

import { cn } from '@/lib/utils'
import { Avatar, AvatarFallback } from './avatar'

function PersonCard({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="person-card"
      className={cn(
        'flex items-center gap-3 rounded-xl border border-border bg-card p-3',
        className,
      )}
      {...props}
    />
  )
}

function PersonCardAvatar({
  name,
  className,
  ...props
}: React.ComponentProps<'div'> & { name: string }) {
  const initial = name.charAt(0)

  return (
    <Avatar className={cn('size-11', className)} {...props}>
      <AvatarFallback className="bg-secondary text-sm font-bold text-secondary-foreground">
        {initial}
      </AvatarFallback>
    </Avatar>
  )
}

function PersonCardInfo({
  className,
  ...props
}: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="person-card-info"
      className={cn('flex min-w-0 flex-1 flex-col gap-0.5', className)}
      {...props}
    />
  )
}

function PersonCardName({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="person-card-name"
      className={cn('truncate text-sm font-medium text-card-foreground', className)}
      {...props}
    />
  )
}

function PersonCardRelation({
  className,
  ...props
}: React.ComponentProps<'span'>) {
  return (
    <span
      data-slot="person-card-relation"
      className={cn('truncate text-xs text-muted-foreground', className)}
      {...props}
    />
  )
}

export {
  PersonCard,
  PersonCardAvatar,
  PersonCardInfo,
  PersonCardName,
  PersonCardRelation,
}
