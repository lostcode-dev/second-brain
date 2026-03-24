import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../../utils/supabase'
import { requireAuthUser } from '../../../../utils/require-auth'

const paramsSchema = z.object({
  triggerHabitId: z.string().uuid()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { triggerHabitId } = paramsSchema.parse(getRouterParams(event))

  const supabase = getSupabaseAdminClient()

  const { data, error } = await supabase
    .from('habit_stacks')
    .update({ archived_at: new Date().toISOString() })
    .eq('user_id', user.id)
    .eq('trigger_habit_id', triggerHabitId)
    .is('archived_at', null)
    .select('id')

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao remover empilhamentos', data: error.message })
  }

  return {
    success: true,
    removedCount: data?.length ?? 0
  }
})
