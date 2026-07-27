import * as React from "react";

import { cn } from "@/lib/utils";
import { Badge } from "./badge";
import { EMOTION_META, type Emotion } from "./emotion-picker";

interface DiaryEntryProps extends React.HTMLAttributes<HTMLArticleElement> {
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
        "group rounded-xl border border-border bg-card p-5 transition-colors hover:border-muted-foreground/20",
        className,
      )}
      {...props}
    >
      <header className="flex items-start justify-between gap-3">
        <div className="flex flex-col gap-1">
          <time className="text-xs text-muted-foreground">{date}</time>
          <h3 className="font-medium leading-snug text-card-foreground">{title}</h3>
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
            "mt-3 line-clamp-2 text-sm leading-relaxed text-muted-foreground",
            isHandwritten && "font-hand text-base",
          )}
        >
          {excerpt}
        </p>
      )}
    </article>
  );
}

export { DiaryEntry };
