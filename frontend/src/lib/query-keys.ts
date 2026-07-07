export const queryKeys = {
  relationMap: ['home', 'relation-map'] as const,
  throwback: ['home', 'throwback'] as const,
  persons: (query?: string) => ['persons', query ?? ''] as const,
  person: (id: number) => ['person', id] as const,
  personTimeline: (id: number) => ['person-timeline', id] as const,
  activityFlow: (id: number) => ['activity-flow', id] as const,
  chips: ['chips'] as const,
}
