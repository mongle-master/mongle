import * as React from "react";

import { cn } from "@/lib/utils";

export type Emotion = "joy" | "calm" | "sadness" | "anger" | "gratitude";

export const EMOTION_META: Record<Emotion, { label: string; emoji: string }> = {
  joy: { label: "기쁨", emoji: "☀️" },
  calm: { label: "평온", emoji: "🌊" },
  sadness: { label: "슬픔", emoji: "🌧️" },
  anger: { label: "분노", emoji: "🔥" },
  gratitude: { label: "감사", emoji: "🌱" },
};

const emotionColors: Record<Emotion, string> = {
  joy: "data-[selected=true]:border-emotion-joy data-[selected=true]:bg-emotion-joy/10 data-[selected=true]:text-emotion-joy",
  calm: "data-[selected=true]:border-emotion-calm data-[selected=true]:bg-emotion-calm/10 data-[selected=true]:text-emotion-calm",
  sadness:
    "data-[selected=true]:border-emotion-sadness data-[selected=true]:bg-emotion-sadness/10 data-[selected=true]:text-emotion-sadness",
  anger:
    "data-[selected=true]:border-emotion-anger data-[selected=true]:bg-emotion-anger/10 data-[selected=true]:text-emotion-anger",
  gratitude:
    "data-[selected=true]:border-emotion-gratitude data-[selected=true]:bg-emotion-gratitude/10 data-[selected=true]:text-emotion-gratitude",
};

interface EmotionPickerProps {
  value: Emotion | null;
  onChange: (emotion: Emotion) => void;
  className?: string;
}

function EmotionPicker({ value, onChange, className }: EmotionPickerProps) {
  return (
    <div
      data-slot="emotion-picker"
      role="radiogroup"
      aria-label="감정 선택"
      className={cn("flex gap-2", className)}
    >
      {(Object.keys(EMOTION_META) as Emotion[]).map((emotion) => (
        <button
          key={emotion}
          role="radio"
          aria-checked={value === emotion}
          aria-label={EMOTION_META[emotion].label}
          data-selected={value === emotion}
          data-slot="emotion-option"
          className={cn(
            "flex h-11 w-11 items-center justify-center rounded-lg border border-border bg-secondary text-lg transition-all",
            "hover:border-muted-foreground/40 focus-visible:outline-2 focus-visible:outline-ring",
            emotionColors[emotion],
          )}
          onClick={() => onChange(emotion)}
        >
          {EMOTION_META[emotion].emoji}
        </button>
      ))}
    </div>
  );
}

export { EmotionPicker };
