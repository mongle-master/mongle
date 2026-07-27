import * as React from "react";

import { cn } from "@/lib/utils";

const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, type, ...props }, ref) => (
    <input
      data-slot="input"
      type={type}
      ref={ref}
      className={cn(
        "flex h-9 w-full rounded-md border border-input-border bg-input px-3 py-1 text-sm text-foreground transition-colors",
        "placeholder:text-muted-foreground",
        "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
        "disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      {...props}
    />
  ),
);
Input.displayName = "Input";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    data-slot="textarea"
    ref={ref}
    className={cn(
      "flex min-h-[80px] w-full rounded-md border border-input-border bg-input px-3 py-2 text-sm text-foreground transition-colors",
      "placeholder:text-muted-foreground",
      "focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-ring",
      "disabled:cursor-not-allowed disabled:opacity-50",
      className,
    )}
    {...props}
  />
));
Textarea.displayName = "Textarea";

export { Input, Textarea };
