import * as React from "react";

import { cn } from "../lib/utils";

/**
 * Apple의 frosted 상단 내비게이션. backdrop-blur + hairline 하단 선.
 * 콘텐츠가 아래로 스크롤되면 반투명 뒤로 비친다.
 */
interface NavigationBarProps extends Omit<React.HTMLAttributes<HTMLElement>, "title"> {
  title?: React.ReactNode;
  leading?: React.ReactNode;
  trailing?: React.ReactNode;
}

function NavigationBar({ title, leading, trailing, className, ...props }: NavigationBarProps) {
  return (
    <header
      data-slot="navigation-bar"
      className={cn(
        "sticky top-0 z-40 flex h-13 items-center justify-between gap-3 border-b border-border px-4",
        "bg-background/80 backdrop-blur-xl",
        className,
      )}
      style={{ height: 52 }}
      {...props}
    >
      <div className="flex min-w-0 items-center gap-2">{leading}</div>
      {title ? (
        <h1 className="absolute left-1/2 -translate-x-1/2 truncate text-[17px] font-semibold tracking-[-0.02em]">
          {title}
        </h1>
      ) : null}
      <div className="flex min-w-0 items-center gap-2">{trailing}</div>
    </header>
  );
}

export { NavigationBar };
