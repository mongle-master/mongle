import * as React from "react";

import { cn } from "../lib/utils";

interface SectionHeaderProps extends Omit<React.HTMLAttributes<HTMLDivElement>, "title"> {
  eyebrow?: string;
  title: React.ReactNode;
  description?: React.ReactNode;
  align?: "leading" | "center";
}

/**
 * Apple 마케팅 스타일 섹션 헤더. eyebrow(소문자 간격) + 큰 디스플레이 제목.
 */
function SectionHeader({ eyebrow, title, description, align = "leading", className, ...props }: SectionHeaderProps) {
  return (
    <div
      data-slot="section-header"
      className={cn(
        "flex flex-col gap-3",
        align === "center" && "items-center text-center",
        className,
      )}
      {...props}
    >
      {eyebrow ? (
        <span className="text-[11px] font-semibold tracking-[0.14em] text-primary uppercase">{eyebrow}</span>
      ) : null}
      <h2 className="text-[clamp(28px,5vw,48px)] font-semibold leading-[1.08] tracking-[-0.03em]">{title}</h2>
      {description ? (
        <p className={cn("max-w-xl text-[17px] leading-relaxed text-muted-foreground")}>{description}</p>
      ) : null}
    </div>
  );
}

export { SectionHeader };
