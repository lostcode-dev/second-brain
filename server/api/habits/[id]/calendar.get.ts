import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const paramsSchema = z.object({
  id: z.string().uuid()
})

const querySchema = z.object({
  year: z.coerce.number().int().min(2020).max(2100),
  month: z.coerce.number().int().min(1).max(12)
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { id } = paramsSchema.parse(getRouterParams(event))
  const query = getQuery(event)
  const params = querySchema.parse(query)

  const supabase = getSupabaseAdminClient()

  // Build date range for the requested month
  const startDate = `${params.year}-${String(params.month).padStart(2, '0')}-01`
  const lastDay = new Date(params.year, params.month, 0).getDate()
  const endDate = `${params.year}-${String(params.month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`

  const { data: logs, error } = await supabase
    .from('habit_logs')
    .select('log_date, completed, note')
    .eq('habit_id', id)
    .eq('user_id', user.id)
    .gte('log_date', startDate)
    .lte('log_date', endDate)
    .order('log_date', { ascending: true })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar calendário', data: error.message })
  }

  // Build full month calendar
  const calendar: { date: string, completed: boolean, note: string | null }[] = []
  const logsMap = Object.fromEntries((logs ?? []).map((l: Record<string, unknown>) => [l.log_date, l]))

  for (let day = 1; day <= lastDay; day++) {
    const date = `${params.year}-${String(params.month).padStart(2, '0')}-${String(day).padStart(2, '0')}`
    const log = logsMap[date]
    calendar.push({
      date,
      completed: log?.completed ?? false,
      note: log?.note ?? null
    })
  }

  return calendar
})
