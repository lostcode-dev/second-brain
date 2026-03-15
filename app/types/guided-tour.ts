export enum GuidedTourKey {
  HabitsOverview = 'habits-overview'
}

export interface GuidedTourEntry {
  completed: boolean
  completedAt: string | null
}

export type GuidedTourRegistry = Record<string, GuidedTourEntry>

export interface GuidedToursResponse {
  tours: GuidedTourRegistry
}
