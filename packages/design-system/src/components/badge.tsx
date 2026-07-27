import { cva, type VariantProps } from "class-variance-authority";
import * as React from "react";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1 rounded-pill px-2.5 py-0.5 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default: "bg-secondary text-secondary-foreground",
        primary: "bg-primary/15 text-primary",
        destructive: "bg-destructive/15 text-destructive",
        outline: "border border-border text-foreground",
        joy: "bg-emotion-joy/15 text-emotion-joy",
        calm: "bg-emotion-calm/15 text-emotion-calm",
        sadness: "bg-emotion-sadness/15 text-emotion-sadness",
        anger: "bg-emotion-anger/15 text-emotion-anger",
        gratitude: "bg-emotion-gratitude/15 text-emotion-gratitude",
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
