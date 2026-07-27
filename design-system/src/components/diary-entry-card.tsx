import type * as React from 'react'

import { cn } from '@/lib/utils'

import { Badge } from './badge'
import { EMOTION_LABELS, type Emotion } from './emotions'
import { PersonChip } from './person-chip'

/* 기록 카드: 날짜 eyebrow + 제목 + 본문 미리보기 + 감정 + 함께한 사람.
   레퍼런스 feature-card 문법(순백, 16px 반경, hairline) 위에 조립한다. */
function DiaryEntryCard({
  date,
  title,
  bodyPreview,
  emotion,
  people = [],
  className,
  ...props
}: React.ComponentProps<'article'> & {
  date: string
  title: string
  bodyPreview: string
  emotion?: Emotion
  people?: string[]
}) {
  return (
    <article
      data-slot="diary-entry-card"
      className={cn(
        'flex flex-col gap-3 rounded-xl border border-border bg-card p-6 text-card-foreground transition-shadow hover:shadow-e1',
        className,
      )}
      {...props}
    >
      <div className="flex items-center justify-between gap-2">
        <span className="eyebrow">{date}</span>
        {emotion ? <Badge emotion={emotion}>{EMOTION_LABELS[emotion]}</Badge> : null}
      </div>
      <h3 className="text-title-md font-medium leading-tight">{title}</h3>
      <p className="text-body-sm leading-relaxed text-body">{bodyPreview}</p>
      {people.length > 0 ? (
        <div className="mt-1 flex flex-wrap gap-1.5">
          {people.map((name) => (
            <PersonChip key={name} name={name} size="sm" />
          ))}
        </div>
      ) : null}
    </article>
  )
}

export { DiaryEntryCard }
