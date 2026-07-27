import { Search } from "lucide-react";
import * as React from "react";

import { cn } from "../lib/utils";

/**
 * Apple pill 검색 필드. 회색 채움 + 중앙 정렬 아이콘/플레이스홀더, 포커스 시 좌측 정렬.
 */
const SearchField = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <div
      data-slot="search-field"
      className={cn(
        "flex h-10 items-center gap-2 rounded-pill bg-secondary px-3.5 text-secondary-foreground",
        "focus-within:ring-2 focus-within:ring-ring/40",
        className,
      )}
    >
      <Search className="size-4 shrink-0 text-muted-foreground" />
      <input
        ref={ref}
        className="w-full bg-transparent text-[15px] outline-none placeholder:text-muted-foreground"
        {...props}
      />
    </div>
  ),
);
SearchField.displayName = "SearchField";

export { SearchField };
