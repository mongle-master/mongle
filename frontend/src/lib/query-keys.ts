export const queryKeys = {
  relationMap: ['home', 'relation-map'] as const,
  throwback: ['home', 'throwback'] as const,
  persons: (query?: string) => ['persons', query ?? ''] as const,
  person: (id: number) => ['person', id] as const,
  personTimeline: (id: number, categoryChipIds?: number[]) =>
    ['person-timeline', id, categoryChipIds?.join(',') ?? ''] as const,
  activityFlow: (id: number) => ['activity-flow', id] as const,
  myTimeline: (categoryChipIds?: number[], personIds?: number[]) =>
    [
      'my-timeline',
      categoryChipIds?.join(',') ?? '',
      personIds?.join(',') ?? '',
    ] as const,
  chips: ['chips'] as const,
}
