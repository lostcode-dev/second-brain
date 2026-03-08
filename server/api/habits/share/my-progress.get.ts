import { requireAuthUser } from '../../../utils/require-auth'
import { getSupabaseAdminClient } from '../../../utils/supabase'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()
  const query = getQuery(event)
  const habitId = typeof query.habitId === 'string' ? query.habitId : null

  if (!habitId) {
    throw createError({ statusCode: 400, statusMessage: 'habitId é obrigatório' })
  }

  const { data: habit } = await supabase
    .from('habits')
    .select('id, name, description, frequency, difficulty, habit_type, scheduled_time, created_at, identity:identities(name), streak:habit_streaks(current_streak)')
    .eq('user_id', user.id)
    .eq('id', habitId)
    .is('archived_at', null)
    .maybeSingle()

  if (!habit) {
    throw createError({ statusCode: 404, statusMessage: 'Hábito não encontrado' })
  }

  const streak = habit.streak as Record<string, unknown> | Record<string, unknown>[] | null
  const streakVal = Array.isArray(streak) ? streak[0] : streak
  const identity = habit.identity as Record<string, unknown> | Record<string, unknown>[] | null
  const identityVal = Array.isArray(identity) ? identity[0] : identity

  const now = new Date()
  const today = now.toISOString().split('T')[0]!

  const date7d = new Date(now)
  date7d.setDate(date7d.getDate() - 7)
  const start7d = date7d.toISOString().split('T')[0]!

  const date30d = new Date(now)
  date30d.setDate(date30d.getDate() - 30)
  const start30d = date30d.toISOString().split('T')[0]!

  let completionRate7d = 0
  let completionRate30d = 0
  let totalCompletions30d = 0

  const { data: logs30d } = await supabase
    .from('habit_logs')
    .select('log_date, completed')
    .eq('user_id', user.id)
    .eq('habit_id', habitId)
    .gte('log_date', start30d)
    .lte('log_date', today)

  const allLogs = logs30d ?? []
  const logs7d = allLogs.filter((l: Record<string, unknown>) => (l.log_date as string) >= start7d)

  const completed7d = logs7d.filter((l: Record<string, unknown>) => l.completed).length
  const total7d = logs7d.length || 1
  completionRate7d = Math.round((completed7d / total7d) * 100)

  totalCompletions30d = allLogs.filter((l: Record<string, unknown>) => l.completed).length
  const total30d = allLogs.length || 1
  completionRate30d = Math.round((totalCompletions30d / total30d) * 100)

  return {
    habit: {
      id: habit.id as string,
      name: habit.name as string,
      description: (habit.description as string | null) ?? null,
      frequency: habit.frequency as string,
      difficulty: habit.difficulty as string,
      habitType: (habit.habit_type as string) ?? 'positive',
      scheduledTime: (habit.scheduled_time as string | null) ?? null,
      createdAt: habit.created_at as string,
      identityName: (identityVal?.name as string | null) ?? null,
      streakCurrent: (streakVal?.current_streak as number) ?? 0
    },
    completionRate7d,
    completionRate30d,
    totalCompletions30d
  }
})
