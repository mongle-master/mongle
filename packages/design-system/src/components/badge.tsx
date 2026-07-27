import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "../lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-3 py-1 text-[11px] font-semibold transition-colors",
  {
    variants: {
      variant: {
        default: "bg-accent text-accent-foreground",
        primary: "bg-primary/10 text-primary",
        destructive: "bg-destructive/10 text-destructive",
        outline: "border border-border text-muted-foreground",
        joy: "bg-emotion-joy/12 text-emotion-joy",
        calm: "bg-emotion-calm/12 text-emotion-calm",
        sadness: "bg-emotion-sadness/12 text-emotion-sadness",
        anger: "bg-emotion-anger/12 text-emotion-anger",
        gratitude: "bg-emotion-gratitude/12 text-emotion-gratitude",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLSpanElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, ...props }: BadgeProps) {
  return <span data-slot="badge" className={cn(badgeVariants({ variant }), className)} {...props} />;
}

export { Badge, badgeVariants };
