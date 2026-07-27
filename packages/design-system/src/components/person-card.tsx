import * as React from "react";

import { cn } from "@/lib/utils";

interface PersonCardProps extends React.HTMLAttributes<HTMLDivElement> {
  name: string;
  relation?: string;
  avatarUrl?: string;
  lastRecord?: string;
}

function PersonCard({ name, relation, avatarUrl, lastRecord, className, ...props }: PersonCardProps) {
  return (
    <div
      data-slot="person-card"
      className={cn(
        "flex items-center gap-3 rounded-xl border border-border bg-card p-4 transition-colors hover:border-muted-foreground/20",
        className,
      )}
      {...props}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-secondary text-sm font-medium text-secondary-foreground">
        {avatarUrl ? (
          <img src={avatarUrl} alt={name} className="h-full w-full rounded-full object-cover" />
        ) : (
          name.charAt(0)
        )}
      </div>
      <div className="flex min-w-0 flex-col">
        <span className="truncate text-sm font-medium text-card-foreground">{name}</span>
        {relation && <span className="text-xs text-muted-foreground">{relation}</span>}
      </div>
      {lastRecord && (
        <time className="ml-auto shrink-0 text-xs text-muted-foreground">{lastRecord}</time>
      )}
    </div>
  );
}

export { PersonCard };
