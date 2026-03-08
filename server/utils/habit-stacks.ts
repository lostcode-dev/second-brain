function mapStackHabit(row: Record<string, unknown> | null | undefined): Record<string, unknown> | null {
  if (!row) return null

  return {
    id: row.id,
    name: row.name
  }
}

export function mapHabitStack(row: Record<string, unknown>): Record<string, unknown> {
  return {
    id: row.id,
    userId: row.userId ?? row.user_id,
    triggerHabitId: row.triggerHabitId ?? row.trigger_habit_id,
    newHabitId: row.newHabitId ?? row.new_habit_id,
    createdAt: row.createdAt ?? row.created_at,
    archivedAt: row.archivedAt ?? row.archived_at ?? null,
    triggerHabit: mapStackHabit((row.triggerHabit ?? null) as Record<string, unknown> | null),
    newHabit: mapStackHabit((row.newHabit ?? null) as Record<string, unknown> | null)
  }
}

export function mapHabitStacks(rows: Record<string, unknown>[] | null | undefined): Record<string, unknown>[] {
  return (rows ?? []).map(mapHabitStack)
}