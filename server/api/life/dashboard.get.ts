import { z } from 'zod'
import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

const querySchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Data deve estar no formato YYYY-MM-DD').optional()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const query = getQuery(event)
  const params = querySchema.parse(query)

  const today = params.date ?? new Date().toISOString().split('T')[0]!
  const dayOfWeek = new Date(`${today}T12:00:00Z`).getUTCDay()

  const supabase = getSupabaseAdminClient()

  // ─── Habits ───────────────────────────────────────────────────────────────
  const { data: habits } = await supabase
    .from('habits')
    .select('id, name, frequency, difficulty, custom_days, streak:habit_streaks(current_streak)')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: true })

  const todayHabits = (habits ?? []).filter((h: Record<string, unknown>) => {
    if (h.frequency === 'daily') return true
    if (h.frequency === 'weekly') return dayOfWeek === 1
    if (h.frequency === 'custom' && h.custom_days) {
      return (h.custom_days as number[]).includes(dayOfWeek)
    }
    return false
  })

  const habitIds = todayHabits.map((h: Record<string, unknown>) => h.id as string)
  let habitLogs: Record<string, boolean> = {}

  if (habitIds.length > 0) {
    const { data: logsData } = await supabase
      .from('habit_logs')
      .select('habit_id, completed')
      .eq('user_id', user.id)
      .eq('log_date', today)
      .in('habit_id', habitIds)

    if (logsData) {
      habitLogs = Object.fromEntries(
        logsData.map((l: Record<string, unknown>) => [l.habit_id, l.completed as boolean])
      )
    }
  }

  const dashboardHabits = todayHabits.map((h: Record<string, unknown>) => {
    const streak = h.streak as Record<string, unknown> | Record<string, unknown>[] | null
    const streakVal = Array.isArray(streak) ? streak[0] : streak
    return {
      id: h.id as string,
      name: h.name as string,
      frequency: h.frequency as string,
      difficulty: h.difficulty as string,
      completed: habitLogs[h.id as string] ?? false,
      streakCurrent: (streakVal?.current_streak as number) ?? 0
    }
  })

  const habitsCompleted = dashboardHabits.filter(h => h.completed).length

  // ─── Tasks ────────────────────────────────────────────────────────────────
  const { data: tasks } = await supabase
    .from('tasks')
    .select('id, title, priority, status, due_date, list:task_lists(name)')
    .eq('user_id', user.id)
    .in('status', ['pending', 'in_progress'])
    .order('due_date', { ascending: true, nullsFirst: false })
    .limit(20)

  const dashboardTasks = (tasks ?? []).map((t: Record<string, unknown>) => {
    const list = t.list as Record<string, unknown> | Record<string, unknown>[] | null
    const listVal = Array.isArray(list) ? list[0] : list
    return {
      id: t.id as string,
      title: t.title as string,
      priority: t.priority as string,
      status: t.status as string,
      dueDate: (t.due_date as string) ?? null,
      listName: (listVal?.name as string) ?? null
    }
  })

  const overdueCount = dashboardTasks.filter(t => t.dueDate && t.dueDate < today).length
  const pendingCount = dashboardTasks.length

  // ─── Events ───────────────────────────────────────────────────────────────
  const dayStart = `${today}T00:00:00Z`
  const dayEnd = `${today}T23:59:59Z`

  const { data: events } = await supabase
    .from('events')
    .select('id, title, start_at, end_at, all_day, calendar:calendars(name, color)')
    .eq('owner_user_id', user.id)
    .is('archived_at', null)
    .lte('start_at', dayEnd)
    .gte('end_at', dayStart)
    .order('start_at', { ascending: true })
    .limit(20)

  const dashboardEvents = (events ?? []).map((e: Record<string, unknown>) => {
    const cal = e.calendar as Record<string, unknown> | Record<string, unknown>[] | null
    const calVal = Array.isArray(cal) ? cal[0] : cal
    return {
      id: e.id as string,
      title: e.title as string,
      startAt: e.start_at as string,
      endAt: e.end_at as string,
      allDay: e.all_day as boolean,
      calendarName: (calVal?.name as string) ?? 'Calendário',
      calendarColor: (calVal?.color as string) ?? null
    }
  })

  // ─── Journal ──────────────────────────────────────────────────────────────
  const { data: journalEntries } = await supabase
    .from('journal_entries')
    .select('id, entry_date, title, content')
    .eq('user_id', user.id)
    .eq('entry_date', today)
    .limit(1)

  const journalRow = journalEntries && journalEntries.length > 0
    ? journalEntries[0] as unknown as Record<string, unknown>
    : null

  const journal = {
    id: journalRow ? (journalRow.id as string) : null,
    entryDate: today,
    title: journalRow ? (journalRow.title as string | null) : null,
    contentPreview: journalRow
      ? ((journalRow.content as string) ?? '').substring(0, 120)
      : null,
    exists: !!journalRow
  }

  return {
    date: today,
    habits: {
      items: dashboardHabits,
      completedCount: habitsCompleted,
      totalCount: dashboardHabits.length
    },
    tasks: {
      items: dashboardTasks,
      pendingCount,
      overdueCount
    },
    events: {
      items: dashboardEvents,
      totalCount: dashboardEvents.length
    },
    journal
  }
})
