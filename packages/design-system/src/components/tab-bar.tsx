import * as React from "react";

import { cn } from "../lib/utils";

export interface TabBarItem {
  key: string;
  label: string;
  icon: React.ReactNode;
}

interface TabBarProps extends React.HTMLAttributes<HTMLElement> {
  items: TabBarItem[];
  value: string;
  onValueChange: (key: string) => void;
}

/**
 * Apple HIG 하단 탭 바. 활성 탭만 브랜드 색, 나머지는 muted.
 * 라벨은 10px, 아이콘 24px, 전체 높이 56px + safe-area.
 */
function TabBar({ items, value, onValueChange, className, ...props }: TabBarProps) {
  return (
    <nav
      data-slot="tab-bar"
      className={cn(
        "flex items-stretch justify-around border-t border-border bg-background/90 backdrop-blur-xl",
        className,
      )}
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
      {...props}
    >
      {items.map((item) => {
        const active = item.key === value;
        return (
          <button
            key={item.key}
            type="button"
            aria-current={active ? "page" : undefined}
            data-state={active ? "active" : "inactive"}
            onClick={() => onValueChange(item.key)}
            className={cn(
              "flex flex-1 flex-col items-center justify-center gap-0.5 py-2 transition-colors active:scale-95",
              active ? "text-primary" : "text-muted-foreground",
            )}
          >
            <span className="flex h-6 items-center justify-center [&_svg]:size-6">{item.icon}</span>
            <span className="text-[10px] font-medium">{item.label}</span>
          </button>
        );
      })}
    </nav>
  );
}

export { TabBar };
