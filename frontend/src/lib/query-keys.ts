export const queryKeys = {
  relationMap: (relationTagChipIds?: number[]) =>
    ['home', 'relation-map', relationTagChipIds?.join(',') ?? ''] as const,
  throwback: ['home', 'throwback'] as const,
  event: (id: number) => ['event', id] as const,
  persons: (query?: string) => ['persons', query ?? ''] as const,
  person: (id: number) => ['person', id] as const,
  personTimeline: (id: number, categoryChipIds?: number[]) =>
    ['person-timeline', id, categoryChipIds?.join(',') ?? ''] as const,
  myTimeline: (categoryChipIds?: number[], personIds?: number[]) =>
    [
      'my-timeline',
      categoryChipIds?.join(',') ?? '',
      personIds?.join(',') ?? '',
    ] as const,
  chips: ['chips'] as const,
}
