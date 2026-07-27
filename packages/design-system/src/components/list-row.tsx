import { ChevronRight } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

/**
 * Apple Settings 스타일 그룹드 리스트. 둥근 그룹 컨테이너 + hairline divider.
 */
function GroupedList({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      data-slot="grouped-list"
      className={cn("overflow-hidden rounded-xl border border-border bg-card", className)}
      {...props}
    />
  );
}

interface ListRowProps extends Omit<React.ButtonHTMLAttributes<HTMLButtonElement>, "title"> {
  leading?: React.ReactNode;
  title: React.ReactNode;
  subtitle?: React.ReactNode;
  trailing?: React.ReactNode;
  chevron?: boolean;
  withDivider?: boolean;
}

function ListRow({
  leading,
  title,
  subtitle,
  trailing,
  chevron = false,
  withDivider = true,
  className,
  ...props
}: ListRowProps) {
  return (
    <button
      type="button"
      data-slot="list-row"
      className={cn(
        "flex w-full items-center gap-3 px-4 py-3 text-left transition-colors",
        "hover:bg-accent/50 active:bg-accent",
        withDivider && "border-b border-border",
        className,
      )}
      {...props}
    >
      {leading ? <span className="flex shrink-0 items-center">{leading}</span> : null}
      <span className="flex min-w-0 flex-1 flex-col">
        <span className="truncate text-[15px] text-card-foreground">{title}</span>
        {subtitle ? <span className="truncate text-[13px] text-muted-foreground">{subtitle}</span> : null}
      </span>
      {trailing ? <span className="shrink-0 text-[13px] text-muted-foreground">{trailing}</span> : null}
      {chevron ? <ChevronRight className="size-5 shrink-0 text-muted-foreground/60" /> : null}
    </button>
  );
}

export { GroupedList, ListRow };
