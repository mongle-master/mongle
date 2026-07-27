import { X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import type * as React from 'react'

import { cn } from '@/lib/utils'

function Dialog(props: DialogPrimitive.DialogProps) {
  return <DialogPrimitive.Root data-slot="dialog" {...props} />
}

function DialogTrigger(props: DialogPrimitive.DialogTriggerProps) {
  return <DialogPrimitive.Trigger {...props} />
}

function DialogOverlay({ className, ...props }: DialogPrimitive.DialogOverlayProps) {
  return (
    <DialogPrimitive.Overlay
      data-slot="dialog-overlay"
      className={cn(
        'fixed inset-0 z-50 bg-foreground/40 backdrop-blur-[2px]',
        'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0',
        className,
      )}
      {...props}
    />
  )
}

function DialogContent({ className, children, ...props }: DialogPrimitive.DialogContentProps) {
  return (
    <DialogPrimitive.Portal>
      <DialogOverlay />
      <DialogPrimitive.Content
        data-slot="dialog-content"
        className={cn(
          'fixed top-1/2 left-1/2 z-50 w-full max-w-[calc(100%-2rem)] -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-border bg-card p-6 text-card-foreground shadow-e3 sm:max-w-md',
          'data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95',
          className,
        )}
        {...props}
      >
        {children}
        <DialogPrimitive.Close className="absolute top-4 right-4 rounded-full p-1 text-muted-foreground transition-colors hover:bg-secondary hover:text-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/60">
          <X className="size-4" />
          <span className="sr-only">닫기</span>
        </DialogPrimitive.Close>
      </DialogPrimitive.Content>
    </DialogPrimitive.Portal>
  )
}

function DialogHeader({ className, ...props }: React.ComponentProps<'div'>) {
  return <div data-slot="dialog-header" className={cn('flex flex-col gap-1.5 text-left', className)} {...props} />
}

function DialogTitle({ className, ...props }: DialogPrimitive.DialogTitleProps) {
  return (
    <DialogPrimitive.Title
      data-slot="dialog-title"
      className={cn('text-title-md font-medium leading-tight', className)}
      {...props}
    />
  )
}

function DialogDescription({ className, ...props }: DialogPrimitive.DialogDescriptionProps) {
  return (
    <DialogPrimitive.Description
      data-slot="dialog-description"
      className={cn('text-body-sm text-muted-foreground', className)}
      {...props}
    />
  )
}

function DialogFooter({ className, ...props }: React.ComponentProps<'div'>) {
  return (
    <div
      data-slot="dialog-footer"
      className={cn('mt-6 flex justify-end gap-2', className)}
      {...props}
    />
  )
}

export {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
}
