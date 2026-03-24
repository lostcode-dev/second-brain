import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const currentYear = new Date().getFullYear()

const querySchema = z.object({
  year: z.coerce.number().int().min(2000).max(currentYear).default(currentYear)
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { year } = querySchema.parse(getQuery(event))
  const supabase = getSupabaseAdminClient()

  const now = new Date()
  const nowYear = now.getFullYear()
  const today = now.toISOString().split('T')[0]!
  const startDate = new Date(Date.UTC(year, 0, 1, 12, 0, 0))
  const endDate = year === nowYear
    ? new Date(`${today}T12:00:00`)
    : new Date(Date.UTC(year, 11, 31, 12, 0, 0))
  const start = startDate.toISOString().split('T')[0]!
  const end = endDate.toISOString().split('T')[0]!

  const { data: earliestLogRows } = await supabase
    .from('habit_logs')
    .select('log_date')
    .eq('user_id', user.id)
    .order('log_date', { ascending: true })
    .limit(1)

  const earliestYear = earliestLogRows?.[0]?.log_date
    ? new Date(`${earliestLogRows[0].log_date as string}T12:00:00`).getFullYear()
    : nowYear
  const availableYears = Array.from(
    { length: nowYear - earliestYear + 1 },
    (_, index) => nowYear - index
  )

  // Get active habit count
  const { count: habitCount } = await supabase
    .from('habits')
    .select('id', { count: 'exact', head: true })
    .eq('user_id', user.id)
    .is('archived_at', null)

  // Get all logs in range
  const { data: logs } = await supabase
    .from('habit_logs')
    .select('log_date, completed')
    .eq('user_id', user.id)
    .gte('log_date', start)
    .lte('log_date', end)

  // Group by date
  const dateMap: Record<string, { completed: number, total: number }> = {}
  for (const log of logs ?? []) {
    const date = log.log_date as string
    if (!dateMap[date]) {
      dateMap[date] = { completed: 0, total: 0 }
    }
    dateMap[date].total++
    if (log.completed) {
      dateMap[date].completed++
    }
  }

  // Build daily data with completion level (0-4 like GitHub)
  const totalHabits = habitCount ?? 1
  const days: Array<{ date: string, count: number, total: number, level: number }> = []

  const cursor = new Date(start + 'T12:00:00')

  while (cursor <= endDate) {
    const dateStr = cursor.toISOString().split('T')[0]!
    const entry = dateMap[dateStr]
    const completed = entry?.completed ?? 0
    const total = entry?.total ?? 0
    const ratio = totalHabits > 0 ? completed / totalHabits : 0

    let level = 0
    if (ratio > 0 && ratio < 0.25) level = 1
    else if (ratio >= 0.25 && ratio < 0.5) level = 2
    else if (ratio >= 0.5 && ratio < 0.75) level = 3
    else if (ratio >= 0.75) level = 4

    days.push({ date: dateStr, count: completed, total, level })
    cursor.setDate(cursor.getDate() + 1)
  }

  // Weekly completion rate trend for the selected year
  const weeklyRates: Array<{ week: string, rate: number }> = []
  const weekCursor = new Date(start + 'T12:00:00')
  while (weekCursor <= endDate) {
    const weekStart = new Date(weekCursor)
    const weekEnd = new Date(weekCursor)
    weekEnd.setDate(weekEnd.getDate() + 6)
    if (weekEnd > endDate) {
      weekEnd.setTime(endDate.getTime())
    }

    const weekStartStr = weekStart.toISOString().split('T')[0]!
    const weekEndStr = weekEnd.toISOString().split('T')[0]!

    const weekLogs = (logs ?? []).filter(
      (l: Record<string, unknown>) => (l.log_date as string) >= weekStartStr && (l.log_date as string) <= weekEndStr
    )
    const weekCompleted = weekLogs.filter((l: Record<string, unknown>) => l.completed).length
    const weekTotal = weekLogs.length || 1
    const rate = Math.round((weekCompleted / weekTotal) * 100)

    const label = weekStart.toLocaleDateString('pt-BR', { day: '2-digit', month: 'short' })
    weeklyRates.push({ week: label, rate })
    weekCursor.setDate(weekCursor.getDate() + 7)
  }

  return {
    days,
    weeklyRates,
    totalHabits,
    selectedYear: year,
    availableYears
  }
})
