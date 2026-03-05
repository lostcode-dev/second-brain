import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const now = new Date()
  const today = now.toISOString().split('T')[0]

  // 7-day and 30-day ranges
  const date7d = new Date(now)
  date7d.setDate(date7d.getDate() - 7)
  const start7d = date7d.toISOString().split('T')[0]

  const date30d = new Date(now)
  date30d.setDate(date30d.getDate() - 30)
  const start30d = date30d.toISOString().split('T')[0]

  // Get all active habits
  const { data: habits } = await supabase
    .from('habits')
    .select('id, identity_id')
    .eq('user_id', user.id)
    .is('archived_at', null)

  const habitIds = (habits ?? []).map((h: Record<string, unknown>) => h.id as string)

  if (habitIds.length === 0) {
    return {
      completionRate7d: 0,
      completionRate30d: 0,
      averageStreak: 0,
      bestDay: null,
      identityProgress: []
    }
  }

  // Get logs in the last 30 days
  const { data: logs30d } = await supabase
    .from('habit_logs')
    .select('habit_id, log_date, completed')
    .eq('user_id', user.id)
    .in('habit_id', habitIds)
    .gte('log_date', start30d)
    .lte('log_date', today)

  const allLogs = logs30d ?? []

  // Completion rate 7d
  const logs7d = allLogs.filter((l: Record<string, unknown>) => (l.log_date as string) >= start7d!)
  const completed7d = logs7d.filter((l: Record<string, unknown>) => l.completed).length
  const total7d = logs7d.length || 1
  const completionRate7d = Math.round((completed7d / total7d) * 100)

  // Completion rate 30d
  const completed30d = allLogs.filter((l: Record<string, unknown>) => l.completed).length
  const total30d = allLogs.length || 1
  const completionRate30d = Math.round((completed30d / total30d) * 100)

  // Average streak
  const { data: streaks } = await supabase
    .from('habit_streaks')
    .select('current_streak')
    .eq('user_id', user.id)
    .in('habit_id', habitIds)

  const streakValues = (streaks ?? []).map((s: Record<string, unknown>) => s.current_streak as number)
  const averageStreak = streakValues.length > 0
    ? Math.round(streakValues.reduce((a: number, b: number) => a + b, 0) / streakValues.length)
    : 0

  // Best day (most completions)
  const dayCount: Record<string, number> = {}
  const dayNames = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb']
  for (const log of allLogs.filter((l: Record<string, unknown>) => l.completed)) {
    const day = new Date(`${(log as Record<string, unknown>).log_date}T12:00:00Z`).getUTCDay()
    const name = dayNames[day] as string
    dayCount[name] = (dayCount[name] ?? 0) + 1
  }

  const bestDay = Object.entries(dayCount).sort((a, b) => b[1] - a[1])[0]?.[0] ?? null

  // Identity progress
  const { data: identities } = await supabase
    .from('identities')
    .select('*')
    .eq('user_id', user.id)
    .is('archived_at', null)

  const identityProgress = (identities ?? []).map((identity: Record<string, unknown>) => {
    const identityHabits = (habits ?? []).filter((h: Record<string, unknown>) => h.identity_id === identity.id)
    const identityHabitIds = identityHabits.map((h: Record<string, unknown>) => h.id as string)
    const identityLogs = allLogs.filter((l: Record<string, unknown>) => identityHabitIds.includes(l.habit_id as string))
    const completedLogs = identityLogs.filter((l: Record<string, unknown>) => l.completed).length
    const scheduledLogs = identityLogs.length || 1
    const score = Math.round((completedLogs / scheduledLogs) * 100)

    return {
      identity,
      score,
      totalHabits: identityHabits.length,
      completedLogs,
      scheduledLogs
    }
  })

  return {
    completionRate7d,
    completionRate30d,
    averageStreak,
    bestDay,
    identityProgress
  }
})
