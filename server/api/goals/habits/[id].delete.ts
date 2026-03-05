import { z } from 'zod'
import { getSupabaseAdminClient } from '../../../utils/supabase'
import { requireAuthUser } from '../../../utils/require-auth'

const paramsSchema = z.object({
  id: z.string().uuid()
})

export default eventHandler(async (event) => {
  const user = await requireAuthUser(event)
  const { id: linkId } = paramsSchema.parse(getRouterParams(event))

  const supabase = getSupabaseAdminClient()

  // Verify link ownership via goal
  const { data: link, error: linkError } = await supabase
    .from('goal_habits')
    .select('id, goal_id, goals!inner(user_id)')
    .eq('id', linkId)
    .single()

  if (linkError || !link) {
    throw createError({ statusCode: 404, statusMessage: 'Vínculo não encontrado' })
  }

  const goalData = (link as Record<string, unknown>).goals as Record<string, unknown>
  if (goalData.user_id !== user.id) {
    throw createError({ statusCode: 403, statusMessage: 'Acesso negado' })
  }

  const { error } = await supabase
    .from('goal_habits')
    .delete()
    .eq('id', linkId)

  if (error) {
    throw createError({ statusCode: 500, statusMessage: 'Falha ao remover vínculo', data: error.message })
  }

  return { success: true }
})
