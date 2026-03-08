import { getSupabaseAdminClient } from '../../utils/supabase'
import { requireAuthUser } from '../../utils/require-auth'

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('habit_stacks')
    .select('*, trigger_habit:habits!trigger_habit_id(id, name), new_habit:habits!new_habit_id(id, name)')
    .eq('user_id', user.id)
    .is('archived_at', null)
    .order('created_at', { ascending: false })

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao buscar empilhamentos', data: error.message })
  }

  return data ?? []
})
