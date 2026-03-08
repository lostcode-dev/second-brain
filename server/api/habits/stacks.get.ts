import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'
import { mapHabitStacks } from '../../utils/habit-stacks'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('habit_stacks')
    .select('*, triggerHabit:habits!trigger_habit_id(id, name), newHabit:habits!new_habit_id(id, name)')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar empilhamentos', data: error.message })
  }

  return mapHabitStacks((data ?? []) as Record<string, unknown>[])
})
