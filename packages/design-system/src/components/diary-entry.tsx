import * as React from "react";

import { cn } from "../lib/utils";
import { Badge } from "./badge";
import { EMOTION_META, type Emotion } from "./emotion-picker";

interface DiaryEntryProps extends React.HTMLAttributes<HTMLElement> {
  title: string;
  date: string;
  emotion?: Emotion;
  excerpt?: string;
  isHandwritten?: boolean;
}

function DiaryEntry({ title, date, emotion, excerpt, isHandwritten, className, ...props }: DiaryEntryProps) {
  return (
    <article
      data-slot="diary-entry"
      className={cn(
        "group rounded-xl border border-border bg-card p-5 transition-all duration-150 hover:border-muted-foreground/20 active:scale-[0.98]",
        className,
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <time className="text-[11px] text-muted-foreground">{date}</time>
          <h3 className="text-[15px] font-semibold leading-snug tracking-[-0.01em] text-card-foreground">
            {title}
          </h3>
        </div>
        {emotion && (
          <Badge variant={emotion}>
            <span aria-hidden>{EMOTION_META[emotion].emoji}</span>
            {EMOTION_META[emotion].label}
          </Badge>
        )}
      </header>
      {excerpt && (
        <p
          className={cn(
            "mt-3 line-clamp-2 text-[13px] leading-relaxed text-muted-foreground",
            isHandwritten && "font-hand text-[15px]",
          )}
        >
          {excerpt}
        </p>
      )}
    </article>
  );
}

export { DiaryEntry };
